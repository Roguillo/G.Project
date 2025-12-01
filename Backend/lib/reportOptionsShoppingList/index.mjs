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
    let listName = event.shoppingListName
    const [lists] = await pool.query(
      'SELECT * FROM ShoppingLists WHERE name = ? AND shopperID = ?',
      [listName, shopperID]
    );
    if(lists.length == 0) {
      code = 400
      result = ({"error" : "List does not exist"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //create options summary
    let shoppingListID = lists[0].shoppingListID
    const [items] = await pool.query(
      'SELECT * FROM Items WHERE shoppingListID = ?',
      [shoppingListID]
    );
    let options = await Promise.all(
      items.map(async (item) => {
      const [itemRows] = await pool.query(
        'SELECT * FROM Items WHERE name = ? AND price IS NOT NULL',
        [item.name]
      );
      if(itemRows.length == 0) {
        code = 400
        result = ({"error" : "Item does not exist in database"})
        return {
          statusCode: code,
          body: JSON.stringify(result)
        }
      }

      const results  = await Promise.all(
        itemRows.map(async (row) => {
          const [storeRows] = await pool.query(
            'SELECT * FROM Stores WHERE storeID = ?',
            [row.storeID]
          );
  
          return {
            itemID: row.itemID,
            itemName: row.name,
            itemCategory: row.category,
            store: storeRows,
            price: row.price
          };
        }))

      return{
        options: results
      }}))
    code = 200

    result =  ({
      shoppingListID: shoppingListID,
      shoppingListName: listName,
      options: options
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