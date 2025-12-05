import mysql from 'mysql2'
import {config} from './config.mjs'

/**
 * event is JSON of the form:
  
  { 
    "loginToken" : "loginToken",
    "daysPrior": XXX
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
  let getReceipts = (shopperID, date) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT receiptID, chainID, storeID, date FROM Receipts WHERE shopperID = ? AND date >= ? ORDER BY date DESC"
      pool.query(selectQuery, [shopperID, date], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve(rows)
        }
      })
    })
  }

  // Gets a list of items linked to a receiptID
  let getItem = (receipt) => {
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

  // Takes desired days prior to current date and returns it in yyyy-mm-dd format
  let convertDate = (daysPrior) => {
    const monthData = new Array(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334)
    const dateObj = new Date()  // Found at https://www.w3schools.com/js/js_date_methods.asp
    let targetDate = dateObj.getFullYear() * 365 + monthData[dateObj.getMonth()] + dateObj.getDay() - daysPrior

    let returnDay
    let returnMonth
    let returnYear

    // Calculate year
    returnYear = Math.floor(targetDate / 365)
    targetDate = targetDate % 365
    if (targetDate == 0) {
      returnYear -= 1
      targetDate += 365
    }

    // Calculate month
    for (let i = monthData.length-1; i >= 0; i--) {
      if (targetDate > monthData[i]) {
        returnMonth = i+1
        break
      }
    }
    targetDate = targetDate - monthData[returnMonth-1]

    // Calculate day
    returnDay = targetDate

    // Ensures yyyy-mm-dd format (e.g. 2025-3-1 => 2025-03-01)
    if (returnMonth < 10) {
      returnMonth = "0" + returnMonth
    }
    if (returnDay < 10) {
      returnDay = "0" + returnDay
    }

    const formattedDate = returnYear + "-" + returnMonth + "-" + returnDay

    return formattedDate
  }

  try {
    const token = event.loginToken

    const shopperID = await verifyToken(token)

    const date = convertDate(event.daysPrior)

    const receipt = await getReceipts(shopperID, date)

    // Uses the list of receipts and formats each receiptID to have a list of items it contains
    const receiptData = await Promise.all(
      receipt.map(async (receipt) => {
        const item = await getItem(receipt.receiptID)
        return {
          receiptID: receipt.receiptID, date: receipt.date, chainID: receipt.chainID, storeID: receipt.storeID,
          items: item
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