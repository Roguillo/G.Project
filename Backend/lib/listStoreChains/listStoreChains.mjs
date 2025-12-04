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

    //check if chains exist in database
    const [chains] = await pool.query(
      'SELECT * FROM Chains'
    );
    if(chains.length == 0) {
      code = 400
      result = ({"error" : "No chains exist in the system"})
      return {
        statusCode: code,
        body: JSON.stringify(result)
      }
    }

    //get chains summary
    code = 200
    let chainsSummary = await Promise.all(
      chains.map(async (chain) => {
      const [stores] = await pool.query(
        'SELECT * FROM Stores WHERE chainID = ?',
        [chain.chainID]
      );
      return {
        chainID: chain.chainID,
        chainName: chain.name,
        chainUrl: chain.url,
        stores: stores
      }
    }))

    result = chainsSummary
  } catch(error){
    result = "SQL error:" + error
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result),
  };
  return response;
};
