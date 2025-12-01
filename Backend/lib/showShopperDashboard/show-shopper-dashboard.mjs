import   mysql    from 'mysql2'
import { config } from './config.mjs'

var pool = mysql.createPool(
  {
    host    : config.host,
    user    : config.user,
    password: config.password,
    database: config.database
  }
);



//event
/*
{ 
  "loginToken" : "loginTokenXXXX" 
} 
*/



export const handler = async (event) => {
  let response_code, response_body;

  // check whether token exists
  let LoginTokenExists = (token) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT shopperID FROM LoginTokens WHERE loginToken = ?";

      pool.query(query, [token], (error, rows, fields) => {
        if (error) {
          reject(new Error("Database error: " + error.sqlMessage));

        } else if (rows.length === 0) {
          resolve(null);

        } else {
          resolve(true);
        }
      });
    });
  };

  // get chain data
  const getChains = () => new Promise((resolve, reject) => {
    pool.query(
      `SELECT c.chainID, c.name AS chainName, c.url,
              s.storeID, s.name AS storeName, s.address
       FROM Chains c
       LEFT JOIN Stores s ON s.chainID = c.chainID
       ORDER BY c.chainID`,
      (err, rows, fields) => (err) ? (reject(err)) : (resolve(rows))
    );
  });


  try {
    // get usable inputs
    const shopper_ID = await(LoginTokenExists(event.loginToken));
    if (!shopper_ID) throw(new Error("Shopper is not logged in"));

    const chain_data = await(getChains());
    if (!chain_data || chain_data.length === 0) throw(new Error("Data not found or incomplete"));

    // chains and map buffers
    let chains = [];
    let map    = {};

    // get chains data from DB
    chain_data.forEach((chain) => {
      if (!map[chain.chainID]) {
        map[chain.chainID] = { chainID: chain.chainID, name: chain.chainName, url: chain.url, Stores: [] };
        chains.push(map[chain.chainID]);
      }

      if (chain.storeID) {
        map[chain.chainID].Stores.push({ storeID: chain.storeID, storeName: chain.storeName, address: chain.address });
      }
    });

    // the good
    response_code =   200;
    response_body = { chains };

  } catch (error) {
    // the big bad
    response_code =   400;
    response_body = { error: error.message };
  }

  const response = {
    statusCode:                response_code,
    body      : JSON.stringify(response_body)
  };

  return(response);
};
