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
  
  //check if user logged in
  try {
    let loginToken = event.loginToken
    if(!(await verifyToken({loginToken}))) {
      code = 400
      result = ({"error" : "Not logged into account"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    let storeName = event.storeName
    let address = event.address
    let chainName = event.chainName

    //check if chain exists
    const [rows] = await pool.query(
      'SELECT * FROM Chains WHERE name = ?',
      [chainName]
    );
    if(rows.length == 0) {
      code = 400
      result = ({"error" : "Parent chain does not exist"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //check if store is valid
    if(!storeName || !address) {
      code = 400
      result = ({"error" : "Specified store is invalid"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //check if store is already in database
    const [rows2] = await pool.query(
      'SELECT * FROM Stores WHERE name = ? AND address = ?',
      [storeName, address]
    );
    if(rows2.length > 0) {
      code = 400
      result = ({"error" : "Store already exists in database"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //add store to database
    code = 200
    const storeID = "storeID" + crypto.randomUUID()
    const chainID = rows[0].chainID
    const sales = 0
    await pool.query(
      'INSERT INTO Stores (storeID, chainID, name, address, chainName, sales) VALUES (?, ?, ?, ?, ?, ?)',
      [storeID, chainID, storeName, address, chainName, sales]
    );
    const [stores] = await pool.query(
      'SELECT * FROM Stores WHERE chainName = ?',
      [chainName]
    );

    result = ({
      chainID: chainID,
      chainName: chainName,
      url: rows[0].url,
      stores: stores
    })
  } catch(error) {
    code = 400
    result = "SQL error:" + error
  }


  const response = {
    statusCode: code,
    body: JSON.stringify(result),
  };
  return response;
};

