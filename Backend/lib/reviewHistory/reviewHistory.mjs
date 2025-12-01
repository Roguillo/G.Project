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
}).promise()


// Check for auth token, record shopper id if exists
// Get all data on receipts linked to shopper
// Add item data to each receipt

async function verifyToken(token) {
  const [rows] = await pool.query('SELECT * FROM `LoginTokens` WHERE `LoginToken` = ?', [token])
  return rows[0].shopperID
}

async function getReceipts(shopperID) {
  const [rows] = await pool.query('SELECT `receiptID` FROM `Receipts` WHERE `shopperID` = ?', [shopperID])
  return rows
}

async function getItems(receiptID) {
  const [items] = await pool.query('SELECT `name` FROM `Items` WHERE `receiptID` = ?', [receiptID])
}

// async function getReceipts(shopperID) {
//   const [rows] = await pool.query('SELECT * FROM `Receipts` WHERE `shopperID` = ?', [shopperID])
//   for (receipts in rows) {
//     const [receipt, [items]] = await Promise.all([
//       pool.query('SELECT * FROM `Receipts` WHERE `receiptID` = ?', [receipts.receiptID]),
//       pool.query('SELECT * FROM `Items` WHERE `receiptID` = ?', [receipts.receiptID])
//     ])
//   }
// }


export const handler = async (event) => {

  let result
  let code

  try {
    const token = event.loginToken

    // Could not find token
    if (!token) {
      code = 400
      result = {error : "Not logged into account"}
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    const shopperID = await verifyToken(token)

    // Token is not one in table
    if (!shopperID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Token is not valid" })
      }
    }

    const [receipts] = await getReceipts(shopperID)

    console.log(parse(receipts).receiptID)
    receiptID = receipts[0]
    console.log(receiptID)
    const [items] = await getItems(receiptID)

    

    // // Fetch all receipt data
    // code = 200
    // const [rows] = await pool.query('SELECT * FROM `Receipts` WHERE `shopperID` = ?', [shopperID])
    // for (receiptID in rows.receiptID) {
    //   const [receipt, [item]] = await Promise.all([
    //     pool.query('SELECT * FROM `Receipts` WHERE `receiptID` = ?', [receiptID]),
    //     pool.query('SELECT * FROM `Items` WHERE `receiptID` = ?', [receiptID])
    //   ])
    // }

    code = 200
    result = {
      receipts: receipts
      // items: item
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