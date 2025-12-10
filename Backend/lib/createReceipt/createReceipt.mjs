import   mysql    from 'mysql2'
import   crypto   from 'crypto';
import { config } from './config.mjs'

var pool = mysql.createPool(
  {
    host    : config.host,
    user    : config.user,
    password: config.password,
    database: config.database
  }
);


//event
/*
{  
  "loginToken" : "loginTokenXXXX", 
  "storeName"  : "name of store",  
  "chainName"  : "name of chain",  
  "date"       :   
      {  
          "day"   : XXX,  
          "month" : XXX,  
          "year"  : XXX 
      }  
}
*/


export const handler = async (event) => {
  let response_code, response_body;

  // check whether token exists, get shopperID if so
  let LoginTokenGetExists = (token) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT shopperID FROM LoginTokens WHERE loginToken = ?";

      pool.query(query, [token], (error, rows, fields) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));

        } else if (rows.length === 0) {
          resolve(null);

        } else {
          resolve(rows[0]["shopperID"]);
        }
      });
    });
  }

  // to get storeID to help fill out item
  let getStoreID = (name) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT storeID FROM Stores WHERE name = ?"
      pool.query(query, [name], (error, rows, fields) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows.length === 0) {
          resolve(false)
        } else {
          resolve(rows[0]["storeID"])
        } 
      })
    })
  }

  // to get storeID to help fill out item
  let getChainID = (name) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT chainID FROM Chains WHERE name = ?"
      pool.query(query, [name], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else if (rows.length === 0) {
          resolve(false)
        } else {
          resolve(rows[0]["chainID"])
        }
      })
    })
  }

  // take in receipt fields and create one
  let createReceipt = (date, receiptID, shopperID, storeID, chainID) => {
    return new Promise((resolve, reject) => {
      const query = "INSERT INTO Receipts (date, receiptID, shopperID, storeID, chainID) VALUES (?, ?, ?, ?, ?)";

      pool.query(query, [date, receiptID, shopperID, storeID, chainID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));

        } else {
          resolve(true);
        }
      });
    });
  }


  try {
    // get usable inputs
    const day       = event.date.day;
    const month     = event.date.month;
    const year      = event.date.year;
    let date = "";
    if (day < 10 && month < 10)  { date = year + "-0" + month + "-0" + day; }
    else if (day < 10)           { date = year + "-" + month + "-0" + day; }
    else if (month < 10)         { date = year + "-0" + month + "-" + day; }
    else                         { date = year + "-" + month + "-" + day; }

    const shopperID = await(LoginTokenGetExists(event.loginToken.trim())); // get shopperID if logged in
    if(!shopperID) throw(new Error("Shopper is not logged in"));        // throw error for shopper not logged in
    console.log("shopperID: " + shopperID)

    const storeID   = await getStoreID(event.storeName);
    if(!storeID) throw(new Error("Store does not exist"));
    console.log("storeID: " + storeID)

    const chainID   = await getChainID(event.chainName);
    if(!chainID) throw(new Error("Chain does not exist"));
    console.log("chainID: " + chainID)

    const receiptID = "receiptID" + crypto.randomUUID();            // generate unique receipt ID

    console.log("date: " + date + " receiptID " + receiptID + " shopperID " + shopperID + " storeID " + storeID + " chainID " + chainID)

    // actually create receipt
    await(createReceipt(date, receiptID, shopperID, storeID, chainID));

    console.log("2")

    // good
    response_code =  200;
    response_body =
      { msg      : "Receipt created",
        receiptID: receiptID,
        shopperID: shopperID,
        chainID  : chainID,
        storeID  : storeID
      };

  } catch (error) {
    // bad
    response_code =   400;
    response_body = { error: error.message }
  }


  const response = {
    statusCode:                response_code,
    body      : JSON.stringify(response_body)
  };

  return(response);
};
