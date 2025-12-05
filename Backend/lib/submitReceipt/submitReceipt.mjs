import { config } from './config.mjs';
import   mysql    from 'mysql2';

// open connection to DB
const pool = mysql.createPool({
  host    : config.host,
  user    : config.user,
  password: config.password,
  database: config.database
});

// expected event
/*
    {
        "loginToken" : "loginTokenXXXX",
        "receiptID"  : "receiptIDXXXX",
        "day"        : XX,
        "month"      : XX,
        "year"       : XXXX
    }
*/

// successful response
/*
    {
        "receiptID" : "receiptIDXXXX",
        "shopperID" : "shopperIDXXXX",
        "day"       :  XX,
        "Month"     :  XX,
        "Year"      :  XXXX,
        "store"     :
            {
                "storeID"      : "storeIDXXXX",
                "chain ID"     : "chainIDXXXX",
                "storeName"    : "name of store",
                "chainName"    : "name of chain",
                "storeAddress" : "address of store"
            }
        "items"     : [
            {
                "itemID"       : "itemIDXXXX",
                "itemName"     : "name of item",
                "itemCategory" : "category of item",
                "itemPrice"    :  XXX,

            },
            {...},
            ...
        ]
    }
*/



/**
 * @param   token :   login token given in event  
 * 
 * @returns       :   whether the shopper is logged in
 */
let LoginTokenExists = (token) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT 1 FROM LoginTokens WHERE loginToken = ?`;
        
        pool.query(query, [token], (error, rows) => {
            if (error) reject (new Error("Database error: " + error.sqlMessage));
            else       resolve(rows.length > 0);
        });
    });
}

/**
 * @param goal  :   column to fetch from
 * @param table :   table to fetch from
 * @param ref   :   reference column
 * @param value :   value of reference
 * 
 * @returns     :   corresponding value at goal
 */
let fetchFromDB = (goal, table, ref, value) => {
    return(new Promise((resolve, reject) => {
        const query =  `SELECT \`${goal}\` FROM \`${table}\` WHERE \`${ref}\` = ?`;

        pool.query(query, [value], (error, rows) => {
                 if(error            ) reject (new Error("DB error: " + error.sqlMessage));
            else if(rows.length === 0) resolve(false);
            else                       resolve(rows[0][goal]);
        });
    }));
}

// from receiptID
let getChainID      = (receiptID) => fetchFromDB("chainID"  , "Receipts", "receiptID", receiptID);
let getStoreID      = (receiptID) => fetchFromDB("storeID"  , "Receipts", "receiptID", receiptID);
let getShopperID    = (receiptID) => fetchFromDB("shopperID", "Receipts", "receiptID", receiptID);

// from chainID
let getChainName    = (chainID  ) => fetchFromDB("name"     , "Chains"  , "chainID"  , chainID  );

// from storeID
let getStoreName    = (storeID  ) => fetchFromDB("name"     , "Stores"  , "storeID"  , storeID  );
let getStoreAddress = (storeID  ) => fetchFromDB("address"  , "Stores"  , "storeID"  , storeID  );

/**
 * @param receiptID :   receiptID to fetch items from
 * 
 * @returns         :   items from receiptID
 */
const getItems = (receiptID) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT itemID, name AS itemName, category AS itemCategory, price AS itemPrice
                       FROM Items
                       WHERE receiptID = ?`;

        pool.query(query, [receiptID], (error, rows) => {
            if(error) reject (new Error("DB error: " + error.sqlMessage));
            else      resolve(rows);
        });
    });
};



// handler function
export const handler = async(event) => {
    let response_code, response_body;

    try {
        const loginToken   = event.loginToken;
        if(!loginToken                           ) throw(new Error("Login token not provided"));
        if(!(await(LoginTokenExists(loginToken)))) throw(new Error("Invalid login token"));

        const receiptID    = event.receiptID;
        const day          = event.day;
        const month        = event.month;
        const year         = event.year;

        if(!receiptID) throw(new Error("Receipt ID not provided"));
        if(day   == null) throw(new Error("Day not provided"    ));
        if(month == null) throw(new Error("Month not provided"  ));
        if(year  == null) throw(new Error("Year not provided"   ));

        const shopperID    = await(getShopperID   (receiptID));
        const storeID      = await(getStoreID     (receiptID));
        const chainID      = await(getChainID     (receiptID));
        const storeName    = await(getStoreName   (storeID  ));
        const chainName    = await(getChainName   (chainID  ));
        const storeAddress = await(getStoreAddress(storeID  ));

        if(
            (!shopperID) ||
            (!storeID  ) ||
            (!chainID  ) ||
            (!storeName) ||
            (!chainName) ||
            (!storeAddress)
        ) throw(new Error("ReceiptID does not exist"));

        const store        = {
            "storeID"      : storeID,
            "chainID"      : chainID,
            "storeName"    : storeName,
            "chainName"    : chainName,
            "storeAddress" : storeAddress
        }

        const items        = await(getItems(receiptID));


        response_code      = 200;
        response_body      = 
            {
                "receiptID" : receiptID,
                "shopperID" : shopperID,
                "day"       : day,
                "month"     : month,
                "year"      : year,
                "store"     : store,
                "items"     : items
            }

    } catch(error) {
        response_code = 400;
        response_body =
            {
                error: error.message
            }
    }

    return(
        {
            statusCode: response_code,
            body      : JSON.stringify(response_body)
        }
    );
}