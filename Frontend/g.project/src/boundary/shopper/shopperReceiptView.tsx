import   React            from 'react';
import { Chain, Model, Shopper, Store } from '../../Model'





export function ShopperReceiptView({ model,       instance,      sync      } : 
                                   { model : any, instance: any, sync: any }) {
    // possible fields for JSON
    type APIresponse = {
        category ? : string;
        error    ? : string;
        itemID   ? : string;
        msg      ? : string;
        name     ? : string;
        price    ? : string;
        quantity ? : string;
        receiptID? : string;
        shopperID? : string;
    }
    

    // react state variables
    const [rAPIMessage, updateAPIMessage] = React.useState<APIresponse>();
    // API response message variable
    let APIMessage : any;


    // for testing
    if(!model.shopper)             model.shopper            = new Shopper("", "", "", "");
    if(!model.shopper?.loginToken) model.shopper.loginToken = "test-token1234";
    

    // get date
    const today = new Date         ();
    const day   = today.getDate    ();
    const month = today.getMonth   () + 1;
    const year  = today.getFullYear();

    

    // create receipt controller
    async function CreateReceiptController() {
        // get login token from model
        const loginToken = model.shopper?.loginToken;


        // get store and chain IDs from shopper
        const StoreIDElement = document      .getElementById("store-ID") as HTMLInputElement;
        const ChainIDElement = document      .getElementById("chain-ID") as HTMLInputElement;
        const StoreID        = StoreIDElement.value;
        const ChainID        = ChainIDElement.value;


        await instance.post('/createReceipt', 
                {  
                    "loginToken" : loginToken,
                    "storeID"    : StoreID,
                    "chainID"    : ChainID,
                    "date"       :   
                        {  
                            "day"   : day,  
                            "month" : month,  
                            "year"  : year 
                        }  
                }
                )
                .then((response : any) => {
                    APIMessage = (typeof    (response.data.body) === 'string') ?
                                 (JSON.parse(response.data.body)             ) :
                                 (           response.data.body              );
                    
                    if (APIMessage.error != undefined) {
                        updateAPIMessage(APIMessage.error);

                    } else {
                        updateAPIMessage(APIMessage);
                    
                    }
        });

        //update the local model
        model.makeReceipt(ChainID, today, APIMessage.receiptID, StoreID);
        
        sync();
    }


    async function addItemToReceipt() {
        const inputElementItemName     = document.getElementById("new-item-name"    ) as HTMLInputElement;
        const inputElementItemCategory = document.getElementById("new-item-category") as HTMLInputElement;
        const inputElementItemPrice    = document.getElementById("new-item-price"   ) as HTMLInputElement;
        const inputElementItemQuantity = document.getElementById("new-item-quantity") as HTMLInputElement;

        const itemName     = inputElementItemName.value;
        const itemCategory = inputElementItemCategory.value;
        const itemPrice    = inputElementItemPrice.value;
        const itemQuantity = parseInt(inputElementItemQuantity.value);
    

        await instance.post('/addToReceipt', {
                "loginToken" : model.shopper.loginToken,
                "receiptID"  : model.receipts[model.receipts.length - 1].receiptID, // latest receipt
                "name"       : itemName,
                "category"   : itemCategory, 
                "price"      : itemPrice,
                "quantity"   : itemQuantity
            })
            .then((response : any) => {
                APIMessage = (typeof    (response.data.body) === 'string') ?
                             (JSON.parse(response.data.body)             ) :
                             (           response.data.body              );
                
                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);

                } else {
                    updateAPIMessage(APIMessage      );
                }
            }
        );

        //add each item + set price for each item
        for(let i = 1; i <= itemQuantity; i++){
            model.addItemToReceipt(
                                                          itemCategory,
                APIMessage                               .itemID,
                                                          itemName,
                model.receipts[model.receipts.length - 1].receiptID
            );

            model.receipts[model.receipts.length - 1].
            items[model.receipts[model.receipts.length - 1].items.length - 1].
            setPrice(itemPrice);
        }

        //update
        sync();
    }


     async function removeItemFromReceipt() {
        const inputElementItemName     = document.getElementById("rm-item-name") as HTMLInputElement;
        const itemName     = inputElementItemName.value;

        await instance.post('/removeFromReceipt', {
                "loginToken" : model.shopper.loginToken,
                "receiptID"  : model.receipts[model.receipts.length - 1].receiptID, // latest receipt
                "name" : itemName
            })
            .then((response : any) => {
                APIMessage = (typeof    (response.data.body) === 'string') ?
                             (JSON.parse(response.data.body)             ) :
                             (           response.data.body              );
                
                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);

                } else {
                    updateAPIMessage(APIMessage      );
                }
            }
        );


        //remove the item from the receipt
        const receipt = model.receipts[model.receipts.length-1]
        receipt.rmItemByID(APIMessage.itemID)

        //update
        sync();
    }


    // make another function for remove item from receipt and export it


    /**
     * ok ideas
     * add all receipt info in the header - date of creation, store and chain names
     * then get the data for all of the items and map it to a table list thing like you did in IP2
     * Then have buttons for adding an item and removing an item (with fields)
     * all logic for those will be in the helper FNs
     * figure out how to get the receipt data laterrrrrrrr (probably redo outputs for ur lambda fns) just make the structure rn
     * 
     */

    // ChatGPT for GUI --> prompt: "make it pretty:\n\n <html portion of code>" (for the code we already had)
    return (
    <div style={{ padding: '10px' }}>
        {/* Create Receipt */}
        <div style={{ marginBottom: '15px' }}>
        <input id="store-ID" placeholder="Store ID" style={{ marginRight: '5px' }} />
        <input id="chain-ID" placeholder="Chain ID" style={{ marginRight: '5px' }} />
        <button onClick={CreateReceiptController}>Create Receipt</button>
        </div>

        {/* Add Item */}
        <div style={{ marginBottom: '15px' }}>
        <input id="new-item-name" placeholder="Name" style={{ marginRight: '5px' }} />
        <input id="new-item-category" placeholder="Category" style={{ marginRight: '5px' }} />
        <input id="new-item-price" placeholder="Price" style={{ marginRight: '5px' }} />
        <input id="new-item-quantity" placeholder="Qty" style={{ marginRight: '5px' }} />
        <button onClick={addItemToReceipt}>Add Item</button>
        </div>

        {/* Show Current Receipt Items */}
        <div>Current Receipt</div>
        <div>Date: {month}/{day}/{year}</div>
        <div>Chain: {model.receipts[model.receipts.length - 1]?.chainID ?? ''}</div>
        <div>Store: {model.receipts[model.receipts.length - 1]?.storeID ?? ''}</div>

        <div style={{ marginBottom: '15px' }}>
        <table border={1} cellPadding={5} cellSpacing={0}>
            <thead>
            <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Price</th>
            </tr>
            </thead>
            <tbody>
            {model.receipts.length > 0 &&
                model.receipts[model.receipts.length - 1].items?.map((item: any, index: number) => (
                <tr key={item.ID ?? index}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.price}</td>
                </tr>
                ))}
            </tbody>
        </table>
        </div>
    </div>
    );
}
