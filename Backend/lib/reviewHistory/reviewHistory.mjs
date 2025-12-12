import mysql from 'mysql2'
import {config} from './config.mjs'

/**
 * event is JSON of the form:
  
  { 
    "loginToken" : "loginToken"
  }
  
 */

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
})

export const handler = async (event) => {
  let result
  let code

  // Checks if login token is valid and returns shopperID associated with it
  let verifyToken = (token) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT shopperID FROM LoginTokens WHERE loginToken = ?"
      pool.query(selectQuery, [token], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows.length == 0) {
          reject(new Error("Invalid token"))
        } else {
          resolve(rows[0].shopperID)
        }
      })
    })
  }

  // Gets a list of receipts linked to a shopperID
  let getReceipts = (shopperID) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT receipt.receiptID, receipt.date, chain.name AS chainName, chain.chainID, store.name AS storeName, store.storeID, store.address FROM Receipts as receipt INNER JOIN Stores as store INNER JOIN Chains as chain ON receipt.storeID = store.storeID AND receipt.chainID = chain.chainID WHERE shopperID = ? ORDER BY date DESC"
      pool.query(selectQuery, [shopperID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve(rows)
        }
      })
    })
  }

  // Gets a list of items linked to a receiptID
  let getItems = (receipt) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT itemID, name, category, price FROM Items WHERE receiptID = ?"
      pool.query(selectQuery, [receipt], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows.length == 0) {
          resolve([])
        } else {
          resolve(rows)
        }
      })
    })
  }


  try {
    const token = event.loginToken

    const shopperID = await verifyToken(token)

    const receipt = await getReceipts(shopperID)

    // Uses the list of receipts and formats each receiptID to have a list of items it contains
    const receiptData = await Promise.all(
      receipt.map(async (receipt) => {
        const items = await getItems(receipt.receiptID)
        return {
          receipt: receipt,
          totalCost: items.reduce((total, item) => total + parseFloat(item.price), 0),
          items: items
        }
      })
    )

    code = 200
    result = {
      receiptData: receiptData
    }

  } catch (error){
    result = "SQL error:" + error
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result),
  }

  return response
}