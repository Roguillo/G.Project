import { config } from './config.mjs'
import mysql from 'mysql2'

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
})

 // check whether token exists
  let LoginTokenExists = (token) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM LoginTokens WHERE loginToken = ?";
      pool.query(query, [token], (error, rows, fields) => {
        // console.log("rows:", rows);
        // console.log("error:", error);
        // console.log("fields:", fields);

        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));

        } else resolve(rows && rows.length > 0)
      });
    });
  }

//   // to get receipt to help remove item
//   let getReceiptID = (itemID) => {
//     return new Promise((resolve, reject) => {
//       const query = "SELECT receiptID FROM Items WHERE itemID = ?"
//       pool.query(query, itemID, (error, rows) => {
//         if (error) {
//           reject(new Error("Database error: " + error.sqlMessage))
//         } else if (rows === 0)
//           {
//             resolve(false)
//         } else {
//           resolve(rows[0]["receiptID"])
//         } 
//       })
//     })
//   }

  //   // get item name
  // let getItemName = (itemID) => {
  //   return new Promise((resolve, reject) => {
  //     const query = "SELECT name FROM Items WHERE itemID = ?"
  //     pool.query(query, [itemID], (error, rows) => {
  //       if (error) {
  //         reject(new Error("Database error: " + error.sqlMessage))
  //       } else if (rows.length === 0)
  //         {
  //           resolve(false)
  //       } else {
  //         resolve(rows[0]["name"])
  //       } 
  //     })
  //   })
  // }

  //get itemID from name and receiptID
  let getItemID = (name, receiptID) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT itemID FROM Items WHERE name = ? AND receiptID = ?"
      pool.query(query, [name, receiptID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows.length === 0)
          {
            resolve(false)
        } else {
          // take the first item that has this name 
          // (if the user wants to get rid of multiple of the same item they have to execute this Lambda fn the desired amount of times)
          resolve(rows[0]["itemID"])
        } 
      })
    })
  }

  let rmItemFromReceipt = (itemID) =>{

    return new Promise((resolve, reject) => {
      const query = "DELETE FROM Items WHERE itemID = ?"
      pool.query(query, [itemID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));
        } else {
          resolve(true);
        } 
      });
   })
  }


    /*
   payload: 
  {  
    "receiptID" : "receiptIDXXXX",
    "name" : "itemName",
    "loginToken" : "loginToken"

  } 

   */

  let response_code
  let response_body
export const handler = async (event) => {
  try{
    const loginToken = event.loginToken
    const isLoggedIn = await(LoginTokenExists(loginToken))
    if(!isLoggedIn) throw(new Error("Shopper is not logged in")); // throw error for shopper not logged in

    const receiptID = event.receiptID
    const name = event.name
    const itemID = await(getItemID(name, receiptID))
    if(!itemID) throw(new Error("Item does not exist"))
  

    // const receiptID = await(getReceiptID(itemID))
    // if(!receiptID) throw(new Error("Item is not attached to a receipt"))

    // const name = await(getItemName(itemID))
    // if(!name) throw(new Error("Item has no name"))
   
    // delete item
    // await(rmItemFromReceipt(itemID, receiptID))
    await(rmItemFromReceipt(itemID))


    response_code =  200;
    response_body = { 
      "name" : name,
      "itemID" : itemID
     };
  }

  catch(error){
    response_code =   400;
    response_body = { error: error.message }
  }
  
  const response = {
    statusCode: response_code,
    body: JSON.stringify(response_body),
  };
  return response;
};
