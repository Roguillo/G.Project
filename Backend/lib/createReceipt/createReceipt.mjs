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
  "storeID"    : "storeIDXXXX",  
  "chainID"    : "chainIDXXXX",  
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
    if (day < 10 && month < 10) {
      date      = year + "-0" + month + "-0" + day;
    } else if (day < 10) {
      date      = year + "-" + month + "-0" + day;
    } else if (month < 10) {
      date      = year + "-0" + month + "-" + day;
    } else {
      date      = year + "-" + month + "-" + day;
    }
    const storeID   = event.storeID;
    const chainID   = event.chainID;
    const shopperID = await(LoginTokenGetExists(event.loginToken.trim())); // get shopperID if logged in
    if(!shopperID) throw(new Error("Shopper is not logged in"));        // throw error for shopper not logged in
    const receiptID = "receiptID" + crypto.randomUUID();            // generate unique receipt ID

    console.log("date: " + date);

    // actually create receipt
    await(createReceipt(date, receiptID, shopperID, storeID, chainID));

    // good
    response_code =  200;
    response_body =
      { msg      : "Receipt created",
        receiptID: receiptID,
        shopperID: shopperID
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
