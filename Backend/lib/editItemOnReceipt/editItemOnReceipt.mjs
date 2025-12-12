import { config } from './config.mjs';
import   mysql    from 'mysql2';
import   crypto   from 'crypto';

// open connection to DB
var pool = mysql.createPool({
  host    : config.host,
  user    : config.user,
  password: config.password,
  database: config.database
});

// expected event
/*
{
    "loginToken"   : "loginTokenXXXXX", 
    "receiptID"    : "receiptIDXXXX",
    "refName"      : "name of item to refer to", 
    "name"         : "item name"
    "category"     : "itemCategory", 
    "quantity"     :  XXX,  
    "price"        :  XXX, 
}  
*/

// successful response
/*
{ 
    "itemIDs"  : ["itemID1", "itemID2", ...], 
    "name"     : "name of item", 
    "category" : "category of item",
    "price"    : XXX,
    "quantity" : XXX
}  
*/

/**
 * @param   token :   login token given in event  
 * 
 * @returns       :   whether the shopper is logged in
 */
let LoginTokenExists = (token) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM LoginTokens WHERE loginToken = ?";
        
        pool.query(query, [token], (error, rows, fields) => {
            if (error) reject (new Error("Database error: " + error.sqlMessage));
            else       resolve(rows.length > 0);

        });
    });
}

/**
 * @param   receiptID  :   receipt ID given in event
 * 
 * @returns            :   store ID of the given receipt
 */
let getStoreID = (receiptID) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT storeID FROM Receipts WHERE receiptID = ?";
        
        pool.query(query, [receiptID], (error, rows, fields) => {
            if      (error            ) reject (new Error("Database error: " + error.sqlMessage));
            else if (rows.length === 0) resolve(false);
            else                        resolve(rows[0]["storeID"]); 
        });
    });
}

/**
 * @param   name      :   name of item
 * @param   receiptID :   receipt ID given in event
 * 
 * @returns           :   gets ID for first matching item
 */
let getItemID = (name, receiptID) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT itemID FROM Items WHERE name = ? AND receiptID = ?"
        
        pool.query(query, [name, receiptID], (error, rows, fields) => {
            if (error) {
                reject(new Error("Database error: " + error.sqlMessage));

            } else if (rows.length === 0) {
                resolve(false);

            } else {
                resolve(rows[0]["itemID"]);
            } 
        });
    });
}

/**
 * @param   name      :   name of item
 * @param   receiptID :   receipt ID given in event
 * 
 * @returns           :   gets category for first matching item
 */
let getItemCategory = (name, receiptID) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT category FROM Items WHERE name = ? AND receiptID = ?"
        
        pool.query(query, [name, receiptID], (error, rows, fields) => {
            if (error) {
                reject(new Error("Database error: " + error.sqlMessage));

            } else if (rows.length === 0) {
                resolve(null);

            } else {
                resolve(rows[0]["category"]);
            } 
        });
    });
}

/**
 * @param   name      :   name of item
 * @param   receiptID :   receipt ID given in event
 * 
 * @returns           :   gets price for first matching item
 */
let getItemPrice = (name, receiptID) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT price FROM Items WHERE name = ? AND receiptID = ?"
        
        pool.query(query, [name, receiptID], (error, rows, fields) => {
            if (error) {
                reject(new Error("Database error: " + error.sqlMessage));

            } else if (rows.length === 0) {
                resolve(null);

            } else {
                resolve(rows[0]["price"]);
            } 
        });
    });
}

/**
 * @param   itemID    :   item ID of item to add
 * @param   storeID   :   store ID corresponding to item
 * @param   receiptID :   receipt ID corresponding to item
 * @param   name      :   item name
 * @param   category  :   item category
 * @param   price     :   item price
 * 
 * @returns           :   adds item to DB
 */
let addItemToReceipt = (itemID, storeID, receiptID, name, category, price) => {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO Items (itemID, storeID, receiptID, name, category, price) VALUES (?, ?, ?, ?, ?, ?)";
        
        pool.query(query, [itemID, storeID, receiptID, name, category, price], (error, rows, fields) => {
            if(error) reject (new Error("Database error: " + error.sqlMessage));
            else      resolve(true);
      });
   });
}

/**
 * @param  itemID :   given item ID
 * 
 * @returns       :   deletes corresponding item
 */
let removeItemFromReceipt = (itemID) =>{
    return new Promise((resolve, reject) => {
        const query = "DELETE FROM Items WHERE itemID = ?"
        
        pool.query(query, [itemID], (error, rows, fields) => {
            if (error) {
                reject(new Error("Database error: " + error.sqlMessage));
            
            } else {
                resolve(true);
            } 
        });
    })
}



// handler function
export const handler = async(event) => {
    let response_code, response_body;
    
    try {
        const loginToken              = event.loginToken;
        const receiptID               = event.receiptID;
        const refName                 = event.refName;

        let   name                    = event.name;
        if(!name) name                = refName;

        let   category                = event.category;
        if(category == "") category   = await(getItemCategory(refName, receiptID));

        let   price                   = event.price;
        if(price == null)    price    = await(getItemPrice   (refName, receiptID));

        // check whether logged in
        const isLoggedIn              = await LoginTokenExists(loginToken);
        if(!isLoggedIn)  throw new Error("Shopper is not logged in");

        // get store ID
        const storeID                 = await getStoreID(receiptID);
        if(!storeID)     throw new Error("Receipt isn't attached to a store");

        // check that quantity is valid
        const quantity                = event.quantity;
        if(quantity < 1) throw new Error("Can't edit 0 or negative items");
        

        let ID, oldItemIDs = [], itemIDs = [];

        while(ID = await(getItemID(refName, receiptID))) {
            oldItemIDs.push(ID);
            await(removeItemFromReceipt(ID));
        }

        if(oldItemIDs.length > 0) {
            for(let i = 0; i < quantity; i++) {
                ID = "itemID" + crypto.randomUUID();
                await(addItemToReceipt(ID, storeID, receiptID, name, category, price));
                itemIDs.push(ID);
            }
        }

        response_code = 200;
        response_body = {
            oldItemIDs,
            itemIDs,
            name,
            category,
            price,
            quantity
        };

    } catch(error) {
        response_code = 400;
        response_body = {
            error: error.message
        };
    }

    return {
        statusCode: response_code,
        body: JSON.stringify(response_body)
    };
}
