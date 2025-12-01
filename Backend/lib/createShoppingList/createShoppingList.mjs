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

    let shoppingListName = event.shoppingListName
    //check if name is valid
    if(shoppingListName == null) {
      code = 400
      result = ({"error" : "Invalid shopping list name"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }
    if(shoppingListName == '') {
      code = 400
      result = ({"error" : "Input name must have at least one character"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //check if name already exists
    const [lists] = await pool.query(
      'SELECT * FROM ShoppingLists WHERE name = ? AND shopperID = ?',
      [shoppingListName, shopperID]
    );
    if(lists.length > 0) {
      code = 400
      result = ({"error" : "List name already exists"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //create shopping list
    code = 200
    const shoppingListID = "shoppingListID" + crypto.randomUUID()
    await pool.query(
      'INSERT INTO ShoppingLists (shoppingListID, shopperID, name) VALUES (?, ?, ?)',
      [shoppingListID, shopperID, shoppingListName]
    );

    result =  ({
      shoppingListID: shoppingListID,
      shoppingListName: shoppingListName,
      items: []
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
