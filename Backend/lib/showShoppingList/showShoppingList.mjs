import { config } from './config.mjs'
import mysql from 'mysql2'


// Specify credentials
var pool = mysql.createPool({
  host:     config.host,
  user:     config.user,
  password: config.password,
  database: config.database
})

export const handler = async (event) => {
  let result
  let code


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


  //we need to populate the model with shopping list info
  let getShoppingListItemNames = (shoppingListID) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT name FROM Items WHERE shoppingListID = ?"
      pool.query(query, [shoppingListID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage))
        } else {
          resolve(rows)
        }
      })
    })
  }

   /*
    input:
    "shoppingListID" : selectElementSLID.value,
    "loginToken" : model.getLoginToken()
   */

  try {
    // Define JSON inputs as variables
    const shoppingListID = event.shoppingListID
    const loginToken = event.loginToken

    const isLoggedIn = await(LoginTokenExists(loginToken))
    if(!isLoggedIn) throw(new Error("Shopper is not logged in")); // throw error for shopper not logged in

    //obtain items
    const items = await getShoppingListItemNames(shoppingListID)


    // Returns 200 and success result
    result = { 
               "SLItems" : items
              }
    code = 200

  } catch (error) {
    result = { error: error.message }
    code = 400
  }


  const response = {
    statusCode: code,
    body: JSON.stringify(result)
  }

  //pool.end()   // Close DB connections, commented out because it caused issues with mysql2

  return response
}