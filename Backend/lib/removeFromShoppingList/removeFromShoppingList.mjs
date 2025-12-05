import { config } from './config.mjs'
import mysql from 'mysql2'

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
})

 // check whether token exists and get shopper ID
  let checkLoginAndGetShopperID = (token) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM LoginTokens WHERE loginToken = ?";
      pool.query(query, [token], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));
        } //if there are no shoppers with this login token, return false
        else if (rows.length === 0){
          resolve(false)
        } else resolve(rows[0]["shopperID"])
      });
    });
  }


  //get shopping list
  let getShoppingList = (shoppingListName, shopperID) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ShoppingLists WHERE name = ? AND shopperID = ?';
      pool.query(query, [shoppingListName, shopperID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));
        }
         // return false if there are no shopping lists with these parameters
        else if (rows.length === 0){
        resolve(false)
        } else {
          resolve(rows[0])
        }
      });
    });
  }

  //get itemID from name and shoppingListID
  let getItemID = (name, shoppingListID) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT itemID FROM Items WHERE name = ? AND shoppingListID = ?"
      pool.query(query, [name, shoppingListID], (error, rows) => {
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

  let rmItemFromSL = (itemID) =>{
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM Items WHERE itemID = ?"
      pool.query(query, [itemID], (error, rows) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));
        }
        else if (rows.length === 0){
          reject(new Error("Item not in this shopping list"))
        }
        else {
          resolve(true);
        } 
      });
   })
  }

  let getItems = (shoppingListID) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT itemID, name, category FROM Items WHERE shoppingListID = ?'
      pool.query(query, shoppingListID, (error, rows) => {
        if (error) {
          reject(new Error("Database error: "+ error.sqlMessage))
        }
        else{
          resolve(rows)
        }
    })
  })
}


    /*
   payload: 
  {  
    "listName" : "listName", 
    "itemName" : "itemName", 
    "loginToken" : "loginToken" 
  } 

   */

  let response_code
  let response_body
export const handler = async (event) => {
  try{
    const loginToken = event.loginToken
  
    const shopperID = await(checkLoginAndGetShopperID(loginToken))
    if(!shopperID) throw(new Error("Shopper is not logged in")); // throw error for shopper not logged in

    const itemName = event.itemName

    const shoppingListName = event.listName

    const shoppingList = await(getShoppingList(shoppingListName, shopperID));
    if(!shoppingList) throw(new Error)("Shopping list does not exist")

    const shoppingListID = shoppingList.shoppingListID

    const itemID = await(getItemID(itemName, shoppingListID))
    if(!itemID) throw(new Error("Item does not exist"))
    console.log(itemID)
   
    // delete item
    await(rmItemFromSL(itemID))

    //get items in shopping list to return
    const items = await(getItems(shoppingListID))


    response_code =  200;
    response_body = { 
      shoppingListID: shoppingListID,
      shoppingListName: shoppingListName,
      items: items
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
