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
          reject(new Error("Invalid token"))
        } else {
          resolve(rows[0].shopperID)
        }
      })
    })
  }

  let getMatchingItems = (shopperID, searchField) => {
    searchField = "%" + searchField + "%" // Makes the query search for items that contain the search field
    return new Promise((resolve, reject) => {
      // Found at https://www.w3schools.com/mysql/mysql_join_inner.asp
      const selectQuery = "SELECT item.itemID, item.name, item.category, item.price, receipt.date FROM Items AS item INNER JOIN Receipts AS receipt ON receipt.receiptID = item.receiptID WHERE receipt.shopperID = ? AND item.name LIKE ? ORDER BY date DESC";
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

    const shopperID = await verifyToken(token)

    const items = await getMatchingItems(shopperID, searchField)
    console.log(items)

    code = 200
    result = {
      itemData: items
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