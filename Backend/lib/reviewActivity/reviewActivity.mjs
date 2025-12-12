import mysql from 'mysql2'
import {config} from './config.mjs'

/**
 * event is JSON of the form:
  
  { 
    "loginToken" : "loginToken",
    "activityPeriod": "activityPeriod"
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
  let getReceiptsByPeriod = (shopperID, startDate, endDate) => {
    return new Promise((resolve, reject) => {
      const selectQuery = "SELECT receipt.receiptID, receipt.date, chain.name AS chainName, chain.chainID, store.name AS storeName, store.storeID, store.address FROM Receipts as receipt INNER JOIN Stores as store INNER JOIN Chains as chain ON receipt.storeID = store.storeID AND receipt.chainID = chain.chainID WHERE shopperID = ? AND date >= ? AND date <= ? ORDER BY date DESC"
      pool.query(selectQuery, [shopperID, startDate, endDate], (error, rows) => {
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
      const selectQuery = "SELECT item.name, item.category, item.price, item.itemID FROM Items AS item INNER JOIN Receipts AS receipt ON receipt.receiptID = item.receiptID WHERE receipt.receiptID = ? ORDER BY item.name DESC"
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

    // Gets current date and formats it without hours, minutes, etc.
    var currDate = new Date()
    currDate.setUTCHours(0, 0, 0, 0)

    // Creates different start and end date 
    var startEndDates = []
    if (event.activityPeriod == "daily") {
      for (let i = 1; i <= 7; i++) {
        let tempDate = new Date(currDate)
        tempDate.setDate(tempDate.getDate() - i + 1)

        startEndDates.push([tempDate, tempDate])
      }

    } else if (event.activityPeriod == "weekly") {
      for (let i = 1; i <= 5; i++) {
        let tempStartDate = new Date(currDate)
        tempStartDate.setDate(tempStartDate.getDate() - i*7 + 1)

        let tempEndDate = new Date(tempStartDate)
        tempEndDate.setDate(tempEndDate.getDate() + 6)

        startEndDates.push([tempStartDate, tempEndDate])
      }

    } else if (event.activityPeriod == "monthly") {
      for (let i = 1; i <= 3; i++) {
        let tempStartDate = new Date(currDate)
        tempStartDate.setDate(tempStartDate.getDate() - i*30 + 1)

        let tempEndDate = new Date(tempStartDate)
        tempEndDate.setDate(tempEndDate.getDate() + 29)

        startEndDates.push([tempStartDate, tempEndDate])
      }

    } else {
      throw new Error("Invalid activity period")
    }

    // Gets a set of receipts by timeframe
    const receiptsByPeriod = await Promise.all(
      startEndDates.map(async (dates) => {
        const [startDate, endDate] = dates
        const receipts = await getReceiptsByPeriod(shopperID, startDate, endDate)
        return {
          startDate: startDate,
          endDate: endDate,
          // receipt.receiptID, receipt.date, chain.name, chain.chainID, store.name, store.storeID
          receipts: receipts
        }
      })
    )

    // Takes receipt sets and maps items to them
    const receiptItemData = await Promise.all(
      receiptsByPeriod.map(async (receipts) => {
        const receiptsItems = await Promise.all(
          receipts.receipts.map(async (receipt) => {
            const items = await getItems(receipt.receiptID)
            return {
              receiptID: receipt.receiptID,
              date: receipt.date,
              chainName: receipt.chainName,
              chainID: receipt.chainID,
              storeName: receipt.storeName,
              storeID: receipt.storeID,
              storeAddress: receipt.address,
              items: items,
              totalCost: items.reduce((total, item) => total + parseFloat(item.price), 0)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
            }
          })
        )
        return {
          startDate: receipts.startDate,
          endDate: receipts.endDate,
          receipts: receiptsItems
        }
      })
    )
    

    code = 200
    result = {
      receiptData: receiptItemData
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