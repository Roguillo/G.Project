import mysql from 'mysql2'
import {config} from './config.mjs'

/**
 * event is JSON of the form:
  
  { 
    "loginToken" : "loginToken",
    "searchField": "searchField"
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
          reject(new Error("Not logged into account"))
        } else {
          resolve(rows[0].shopperID)
        }
      })
    })
  }

  let getMatchingItems = (shopperID, searchField) => {
    searchField = "%" + searchField + "%" // Makes the query search for items that contain the search field
    return new Promise((resolve, reject) => {
      // Like found at https://www.w3schools.com/mysql/mysql_join_inner.asp
      const selectQuery = "SELECT item.itemID, item.name, item.category, item.price, receipt.date, chain.name AS chainName, chain.chainID, store.name AS storeName, store.storeID, store.address FROM Items AS item INNER JOIN Receipts AS receipt INNER JOIN Chains AS chain INNER JOIN Stores AS store ON receipt.receiptID = item.receiptID AND receipt.chainID = chain.chainID AND receipt.storeID = store.storeID WHERE receipt.shopperID = ? AND item.name LIKE ? ORDER BY date DESC";
      pool.query(selectQuery, [shopperID, searchField], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve(rows)
        }
      })
    })
  }


  try {
    const token = event.loginToken
    const searchField = event.searchField

    if (searchField == "") { throw new Error("Search field cannot be empty") }

    const shopperID = await verifyToken(token)

    const items = await getMatchingItems(shopperID, searchField)
    console.log(items)

    code = 200
    result = {
      itemData: items
    }

  } catch (error){
    result = error.toString()
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result),
  }

  return response
}