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

  let result
  let code
  try{
    const token = event.adminToken;

    //could not find token
    if (!token) {
      code = 400
      result = {error : "Not logged into account"}
      return {
        statusCode: code,
        body: JSON.stringify(result)
      };
    }

    const valid = await verifyToken(token);

    //token is not one in table
    if (!valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Token is not valid" })
      };
    }

    //fetch dashboard data
    code = 200
    const [shoppers] = await pool.query(
      'SELECT * FROM Shoppers'
    );

    const [stores] = await pool.query(
      'SELECT * FROM Stores'
    );

    const [chains] = await pool.query(
      'SELECT * FROM Chains'
    );

    //compute total sales
    let totalSales = 0
    for(let i = 0; i < chains.length; i++){
      totalSales += chains[i].sales 
    }

    //create chain summary
    let chainsSummary = chains.map(chain => {
      let chainStores = 0
      for(let i = 0; i < stores.length; i++){
        if(stores[i].chainID === chain.chainID){
          chainStores += 1
        }
      }

      return {
        chainID: chain.chainID,
        chainName: chain.name,
        url: chain.url,
        stores: chainStores,
        totalSales: chain.sales
      };
    })

    result = {
      totalShoppers: shoppers.length,
      totalStores: stores.length,
      totalSales: totalSales,
      chains: chainsSummary,
      stores: stores
    }
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
