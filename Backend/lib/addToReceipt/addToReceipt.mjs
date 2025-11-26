import { config } from './config.mjs'
import mysql from 'mysql2'
import crypto from 'crypto';

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
        console.log("rows:", rows);
        console.log("error:", error);
        console.log("fields:", fields);

        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));

        } else resolve(rows && rows.length > 0)
      });
    });
  }

  // to get storeID to help fill out item
  let getStoreID = (receiptID) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT storeID FROM Receipts WHERE receiptID = ?"
      pool.query(query, receiptID, (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows === 0)
          {
            resolve(false)
        } else {
          resolve(rows[0]["storeID"])
        } 
      })
    })
  }


  //TODO: we need to determine how we will get storeID. For now leave it null
  //get store ID from receipt ID. receipt ID should be externally scraped from the webpage.
let addItemToReceipt = (itemID, storeID, receiptID, name, category, price) =>{
    //make item, with no shoppingListID
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO Items (itemID, storeID, receiptID, name, category, price) VALUES (?, ?, ?, ?, ?, ?)"

      pool.query(query, [itemID, storeID, receiptID, name, category, price], (error, rows) => {
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
        "loginToken" : "loginTokenXXXXX", 
        "receiptID"  : "recieptIDXXX",
        "name"       : "name of item",  
        "category"   : "category of item",  
        "quantity"   : XXX,  
        "price"      : XXX 
    }  

    response:
    200:
      {  
    "itemID" : "itemIDXXXX", , 
    "name" : "itemName",  
    "category"  : "itemCategory",  
    "price" : 123 
  } 
   */

  let response_code
  let response_body
export const handler = async (event) => {
  try{
    const loginToken = event.loginToken
    const receiptID = event.receiptID
    const storeID =  await(getStoreID(receiptID))
    if (!storeID)  throw(new Error("receipt isn't attached to a store"))
    const name = event.name
    const category = event.category
    const quantity = event.quantity
    if (quantity < 1) throw (new Error ("Can't add 0 or negative items"))
    const price = event.price
    const isLoggedIn = await(LoginTokenExists(loginToken))
    if(!isLoggedIn) throw(new Error("Shopper is not logged in")); // throw error for shopper not logged in
    
    //initialize itemID array for output
    let itemIDs = []

    // add the item to DB and thus to receipt
    //repeat making this item for as many times as specified by quanitity param
    for (let i = 0; i < quantity; i++){
      let itemID = "itemID" + crypto.randomUUID();            // generate unique item ID
      await(addItemToReceipt(itemID, storeID, receiptID, name, category, price))

      itemIDs.push(itemID)
   }

    let itemInfo = {
    "itemID" : itemIDs,
    "name" : name,  
    "category" : category, 
    "price" : price,
    }

    response_code =  200;
    response_body = { itemInfo };
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

