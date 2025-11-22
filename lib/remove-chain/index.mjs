import mysql from 'mysql2';
import {config} from './config.mjs';

var pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
}).promise()

async function verifyToken(token) {
  const [rows] = await pool.query('SELECT * FROM `AdminTokens` WHERE `adminToken` = ?', [token]);
  return rows.length > 0;
}

export const handler = async (event) => {
  let code 
  let result
  try{
    let token = event.adminToken
    //verify token
    if (!await verifyToken(token)) {
      code = 400
      result = ({"error" : "Not logged into account"})
      return {
        statusCode: code,
        body: JSON.stringify(result),
      };
    }

    //check if chain exists in database
    const [rows] = await pool.query('SELECT * FROM `Chains` WHERE `name` = ?', [event.chainName]);
    if(rows.length == 0){
      code = 400
      result = ({"error" : "Chain does not exist in database"})
      return {
        statusCode: code,
        body: JSON.stringify(result),
      };
    }

    //remove chain from database
    code = 200
    await pool.query('DELETE FROM `Stores` WHERE `chainID` = (SELECT `chainID` FROM `Chains` WHERE `name` = ?)', [event.chainName]);
    await pool.query('DELETE FROM `Chains` WHERE `name` = ?', [event.chainName]);
    
    const [chains] = await pool.query('SELECT * FROM `Chains`');
    const chainsSummary = await Promise.all(
    chains.map(async (chain) => {
      const [stores] = await pool.query(
        'SELECT * FROM `Stores` WHERE `chainID` = ?',
        [chain.chainID]
      );

      return {
        chainID: chain.chainID,
        chainName: chain.name,
        url: chain.url,
        totalSales: chain.sales,
        stores: stores,
      };
    })
  );

  result = chainsSummary;
  } catch (error){
    result = "SQL error:" + error
    code = 400
  }

  const response = {
    statusCode: code,
    body: JSON.stringify(result),
  };
  return response;
};
