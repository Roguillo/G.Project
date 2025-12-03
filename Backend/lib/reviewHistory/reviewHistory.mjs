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

  let verifyToken = (token) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT shopperID FROM LoginTokens WHERE loginToken = ?"
      pool.query(selectQuery, [token], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows.length == 0) {
          reject(new Error("Invalid token"))
        } else {
          resolve(rows)
        }
      })
    })
  }

  let getReceipts = (shopperID) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT receiptID FROM Receipts WHERE shopperID = ?"
      pool.query(selectQuery, [shopperID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve([rows])
        }
      })
    })
  }

  let getItems = (receipt) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT itemID, itemName FROM Items WHERE receiptID = ?"
      pool.query(selectQuery, [receipt], (error, rows) => {
        if (error) {a
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve([rows])
        }
      })
    })
  }


  try {
    const token = event.loginToken

    const [shopperID] = await verifyToken(token)

    const [receipt] = await getReceipts(shopperID.shopperID)

    const [item] = await getItems(receipt)

    code = 200
    result = {
      token: token,
      shopperID: shopperID.shopperID,
      receipts: receipt,
      // receiptData: {
      //   receiptID: receipt.receiptID,
      //   receiptStoreID: receipt.storeID
      // },
      items: item
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