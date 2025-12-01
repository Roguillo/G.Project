import mysql from 'mysql2';
import {config} from './config.mjs';

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
}).promise()

async function verifyToken({loginToken}) {
  const [rows] = await pool.query(
    'SELECT * FROM LoginTokens WHERE loginToken = ?',
    [loginToken]
  );

  return rows.length > 0;
}

export const handler = async (event) => {
  let result 
  let code

  try{
    let loginToken = event.loginToken
    //check if logged in
    if(!(await verifyToken({loginToken}))) {
      code = 400
      result = ({"error" : "Not logged into account"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }
    //get shopperID
    const [shopper] = await pool.query(
      'SELECT * FROM LoginTokens WHERE loginToken = ?',
      [loginToken]
    );
    let shopperID = shopper[0].shopperID

    //check if list exists
    let shoppingListName = event.listName
    const [lists] = await pool.query(
      'SELECT * FROM ShoppingLists WHERE name = ? AND shopperID = ?',
      [shoppingListName, shopperID]
    );
    if(lists.length == 0) {
      code = 400
      result = ({"error" : "List does not exist"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //check if item exists
    let itemName = event.itemName
    if(itemName == "") {
      code = 400
      result = ({"error" : "Invalid item name"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //check if item category exists
    let itemCategory = event.itemCategory
    if(itemCategory == "") {
      code = 400
      result = ({"error" : "Invalid item category"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //add item to shopping list
    code = 200
    let shoppingListID = lists[0].shoppingListID
    const itemID = "itemID" + crypto.randomUUID()
    await pool.query(
      'INSERT INTO Items (itemID, shoppingListID, name, category) VALUES (?, ?, ?, ?)',
      [itemID, shoppingListID, itemName, itemCategory]
    );
    
    //get items in shopping list
    const [items] = await pool.query(
      'SELECT itemID, name, category FROM Items WHERE shoppingListID = ?',
      [shoppingListID]
    );

    result =  ({
      shoppingListID: shoppingListID,
      shoppingListName: shoppingListName,
      items: items
    })

  } catch(error){
    result = "SQL error:" + error
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result),
  }
  return response
};