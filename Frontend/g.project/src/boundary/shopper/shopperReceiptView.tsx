import   React      from 'react';
import { Shopper } from '../../Model';



export function ShopperReceiptView({ model,       instance,      sync      } : 
                                   { model : any, instance: any, sync: any }) {
    // possible fields for JSON
    type APIresponse = {
        category ? : string;
        error    ? : string;
        itemID   ? : string | string[];
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
    let APIMessage :   any;


    // for testing
    if(!model.shopper)             model.shopper            = new Shopper("", "", "", "");
    if(!model.shopper?.loginToken) model.shopper.loginToken = "test-token1234";
    

    // get date
    const today = new Date         ();
    const day   = today.getDate    ();
    const month = today.getMonth   () + 1;
    const year  = today.getFullYear();

    // current receipt
    const currentReceipt = model.receipts[model.receipts.length - 1];

    // submission message
    let submission_message;
    if(currentReceipt) {
        submission_message =   currentReceipt.submitted ?
                             "*Receipt Submitted*"      :
                             "";
    }

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
                        return;

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
                "receiptID"  : currentReceipt.receiptID, // latest receipt
                "name"       : itemName,
                "category"   : itemCategory, 
                "price"      : itemPrice,
                "quantity"   : itemQuantity
            })
            .then((response : any) => {
                // APIMessage = (typeof    (response.data.body) === 'string') ?
                //                 (JSON.parse(response.data.body)             ) :
                //                 (           response.data.body              );
                APIMessage = JSON.parse(response.data.body);

                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage);
                
                }
            });


        //add each item + set price for each item
        for(let i = 1; i <= itemQuantity; i++){
            model.addItemToReceipt(
                itemCategory,
                APIMessage.itemID[i-1],
                itemName,
                currentReceipt.receiptID
            );

            currentReceipt.
            items[currentReceipt.items.length - 1].
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
                "receiptID"  : currentReceipt.receiptID, // latest receipt
                "name" : itemName
            })
            .then((response : any) => {
                APIMessage = (typeof    (response.data.body) === 'string') ?
                             (JSON.parse(response.data.body)             ) :
                             (           response.data.body              );
                
                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage      );
                }
            }
        );

        console.log(APIMessage);
        //remove the item from the receipt
        const receipt = model.receipts[model.receipts.length-1];
        receipt.rmItemByID(APIMessage.itemID);

        //update
        sync();
    }


    async function editItemOnReceipt() {
        const nameElement        = document.getElementById("edit-item-name")         as HTMLInputElement;
        const newNameElement     = document.getElementById("edit-item-new_name")     as HTMLInputElement;
        const newCategoryElement = document.getElementById("edit-item-new_category") as HTMLInputElement;
        const newPriceElement    = document.getElementById("edit-item-new_price")    as HTMLInputElement;
        const newQuantityElement = document.getElementById("edit-item-new_quantity") as HTMLInputElement;

        const name               =            nameElement       .value;
        const newName            =            newNameElement    .value;
        const newCategory        =            newCategoryElement.value;
        const newPrice           = parseFloat(newPriceElement   .value);
        const newQuantity        = parseInt  (newQuantityElement.value);

        await instance.post('/editItemOnReceipt',
                {
                    "loginToken" : model.shopper.loginToken,
                    "receiptID"  : currentReceipt.receiptID,
                    "refName"    : name,
                    "name"       : newName, 
                    "category"   : newCategory,
                    "quantity"   : newQuantity,
                    "price"      : newPrice
                }
            )
            .then((response : any) => {
                APIMessage = (typeof    (response.data.body) === 'string') ?
                             (JSON.parse(response.data.body)             ) :
                             (           response.data.body              );
                
                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage      );
                }
            }
        );

        // expected response
        /*
            { 
                "oldItemIDs" : old -> ["itemID1", "itemID2", ...],
                "itemIDs"    : new -> ["itemID1", "itemID2", ...], 
                "name"       : "name of item", 
                "category"   : "category of item",
                "price"      : XXX,
                "quantity"   : XXX
            } 
        */
       
        const oldItemIDs = APIMessage.oldItemIDs;
        const itemIDs    = APIMessage.itemIDs;
        const receipt    = model.receipts[model.receipts.length-1];

        receipt.editItem(oldItemIDs, newCategory, itemIDs, newName, newQuantity, newPrice);

        sync();
    }


    async function analyzeReceiptImage() {
        const imageElement = document.getElementById("image") as HTMLInputElement;
        const image = imageElement.files![0];

        const imageURL = await(new Promise<string>((resolve, reject) => {
            const reader   = new FileReader();
            reader.onload  = () => resolve(reader.result as string);
            reader.onerror = () => reject (reader.error           );
            reader.readAsDataURL(image);
        }));

        // POST to backend using the same .then() style
        await instance.post('/analyzeReceiptImage',
            {
                "loginToken"  : model.shopper.loginToken,
                "receiptID"   : currentReceipt.receiptID,
                "imageDataUrl": imageURL
            })
            .then((response: any) => {
                APIMessage = (typeof    (response.data.body) === 'string') ?
                             (JSON.parse(response.data.body)             ) :
                             (           response.data.body              );

                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage);
                }
            });

        sync();
    }



    async function submitReceipt() {
        // await instance.post('/submitReceipt',
        //         {
        //             "loginToken" : model.shopper.loginToken,
        //             "receiptID"  : currentReceipt.receiptID,
        //             "day"        : day,
        //             "month"      : month,
        //             "year"       : year
        //         }
        //     )
        //     .then((response : any) => {
        //         APIMessage = (typeof    (response.data.body) === 'string') ?
        //                      (JSON.parse(response.data.body)             ) :
        //                      (           response.data.body              );
                
        //         if (APIMessage.error != undefined) {
        //             updateAPIMessage(APIMessage.error);
        //             return;

        //         } else {
        //             updateAPIMessage(APIMessage      );
        //         }
        //     }
        // );

        const receipt      = model.receipts[model.receipts.length-1];
        receipt.submitted  = true;

        sync();

        let confetti       = (await import('canvas-confetti')).default;
        confetti();
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
        <div
            style={{
                padding: 16,
                fontFamily: 'sans-serif',
                maxWidth: 600,
                margin: '0 auto',
            }}
        >

            {/* Create Receipt */}
            <section style={{ marginBottom: 24 }}>
                <h3>Create Receipt</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input id="store-ID" placeholder="Store ID" />
                    <input id="chain-ID" placeholder="Chain ID" />
                    <button onClick={CreateReceiptController}>Create Receipt</button>
                </div>
            </section>

            {/* Analyze Receipt Image */}
            <section style={{ marginBottom: 24 }}>
                <h3>Analyze Receipt Image</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input id="image" type="file" accept="image/*" />
                    <button onClick={analyzeReceiptImage}>Analyze Receipt Image</button>
                </div>
            </section>

            {/* Add Item */}
            <section style={{ marginBottom: 24 }}>
                <h3>Add Item</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <input id="new-item-name"     placeholder="Name"     />
                    <input id="new-item-category" placeholder="Category" />
                    <input id="new-item-price"    placeholder="Price"    />
                    <input id="new-item-quantity" placeholder="Quantity" />
                    <button onClick={addItemToReceipt}>Add Item</button>
                </div>
            </section>

            {/* Remove Item */}
            <section style={{ marginBottom: 24 }}>
                <h3>Remove Item</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input id="rm-item-name" placeholder="Name" />
                    <button onClick={removeItemFromReceipt}>Remove Item</button>
                </div>
            </section>

            {/* Edit Item */}
            <section style={{ marginBottom: 24 }}>
                <h3>Edit Item</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <input id="edit-item-name"         placeholder="Current Name" />
                    <input id="edit-item-new_name"     placeholder="New Name"     />
                    <input id="edit-item-new_category" placeholder="New Category" />
                    <input id="edit-item-new_price"    placeholder="New Price"    />
                    <input id="edit-item-new_quantity" placeholder="New Quantity" />
                    <button onClick={editItemOnReceipt}>Edit Item</button>
                </div>
            </section>

            {/* Submit Receipt */}
            <section style={{ marginBottom: 24 }}>
                <h3>Submit Receipt</h3>
                <button onClick={submitReceipt}>Submit Receipt</button>
                <div style={{ marginTop: 8 }}>{submission_message}</div>
            </section>

            {/* Show Current Receipt Items */}
            <section style={{ marginBottom: 24 }}>
                <h3>Current Receipt</h3>

                <div>Date: {month}/{day}/{year}</div>
                <div>Chain: {currentReceipt?.chainID ?? ''}</div>
                <div>Store: {currentReceipt?.storeID ?? ''}</div>

                <table
                    border={1}
                    cellPadding={8}
                    cellSpacing={0}
                    style={{
                        marginTop: 16,
                        width: '100%',
                        borderCollapse: 'collapse',
                    }}
                >
                    <thead style={{ backgroundColor: '#008080', color: 'white' }}>
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {model.receipts.length > 0 &&
                            currentReceipt.items?.map((item : any, index : any) => (
                                <tr key={item.ID ?? index}>
                                    <td>{item.name}</td>
                                    <td>{item.category}</td>
                                    <td>{item.price}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </section>

        </div>
    );

}
