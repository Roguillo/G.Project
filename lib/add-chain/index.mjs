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

    let chainName = event.chainName
    let url = event.url

    //check if inputted chain is valid
    if(!chainName || !url) {
      code = 400
      result = ({"error" : "Specified chain is invalid"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //check if chain already exists in database
    const [rows] = await pool.query(
      'SELECT * FROM Chains WHERE name = ?',
      [chainName]
    );
    if(rows.length > 0) {
      code = 400
      result = ({"error" : "Chain already exists in database"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    code = 200
    //add chain to database
    const chainID = "chainID" + crypto.randomUUID()
    const chainSales = 0
    await pool.query(
      'INSERT INTO Chains (chainID, name, url, sales) VALUES (?, ?, ?, ?)',
      [chainID, chainName, url, chainSales]
    );

    result = ({
      chainID: chainID,
      chainName: chainName,
      stores: [],
      url: url,
      chainSales: chainSales
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
}
