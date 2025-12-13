import   React                                      from 'react';
import { Model, Shopper, Item, Receipt, ModelDate } from '../../Model';



export function ShopperReceiptView({ model,       instance,      sync      } : 
                                   { model : Model, instance: any, sync: any }) {
    // possible fields for JSON
    type APIresponse = {
        category     ? : string;
        error        ? : string;
        itemsFromAPI ? : string[];
        itemID       ? : string | string[];
        msg          ? : string;
        name         ? : string;
        price        ? : string;
        quantity     ? : string;
        receiptID    ? : string;
        shopperID    ? : string;
    }

    // react state variables
    const [rAPIMessage    , updateAPIMessage     ] = React.useState<APIresponse>();
    const [rSubmission    , updateSubmission     ] = React.useState             ("");
    const [rLoadingText   , updateLoadingText    ] = React.useState             ("");
    const [rAnalyzedItems , updateAnalyzedItems ] = React.useState<Item[]>     ([]);
    const [rSubmitted     , updateSubmitted      ] = React.useState             (false);
    const [rDay           , updateDay            ] = React.useState<any>        (" ");
    const [rMonth         , updateMonth          ] = React.useState<any>        (" ");
    const [rYear          , updateYear           ] = React.useState<any>        (" ");
    const [rStoreName     , updateStoreName      ] = React.useState             (" ");
    const [rChainName     , updateChainName      ] = React.useState             (" ");

    // API response message variable
    let APIMessage : any;

    // for testing
    if(!model.shopper)             model.shopper            = new Shopper("", "", "", "");
    if(!model.shopper?.loginToken) model.shopper.loginToken = "test-token1234";

    // current receipt
    let currentReceipt = (model.receipts[model.receipts.length - 1]) ?
                         (model.receipts[model.receipts.length - 1]) :
              new Receipt("", new ModelDate(" ", " ", " "), "", ""            ); /* I know there's an error, but the naming is the same as the default 'Date' object,
                                                                       * and I don't want to mess up other functions/use cases that use the model's Date
                                                                       */

    function uuidv4(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            const r = Math.floor(Math.random() * 16);
            const v = c === "x" ? r : (r & 0x3) | 0x8;

            return v.toString(16);
        });
    }




    // create receipt controller
    async function CreateReceiptController() {
        // get login token from model
        const loginToken = model.shopper?.loginToken;

        // get store and chain IDs from shopper
        const StoreAddressElement = document.getElementById("store-address") as HTMLInputElement;
        const dayElement          = document.getElementById("day"          ) as HTMLInputElement;
        const monthElement        = document.getElementById("month"        ) as HTMLInputElement;
        const yearElement         = document.getElementById("year"         ) as HTMLInputElement;

        const StoreAddress        = StoreAddressElement.value;
        if(!StoreAddress) return;

        const day                 = parseInt(dayElement.value);
        if(!day         ) return;
        updateDay(day);

        const month               = parseInt(monthElement.value);
        if(!month       ) return;
        updateMonth(month);

        const year                = parseInt(yearElement.value);
        if(!year        ) return;
        updateYear(year);


        await instance.post('/createReceipt',
            {  
                "loginToken"   : loginToken,
                "storeAddress" : StoreAddress,
                "date"         :   
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
                    updateAPIMessage({ error: APIMessage.error }); console.log(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage); console.log(APIMessage);
                
                }
        });

        const ChainID   = APIMessage.chainID;       
        const StoreID   = APIMessage.storeID;

        updateStoreName(APIMessage.storeName);
        updateChainName(APIMessage.chainName);

        //update the local model
        model.makeReceipt(ChainID, new ModelDate(day, month, year), APIMessage.receiptID, StoreID);
        currentReceipt.submitted = false;
        updateSubmitted(currentReceipt.submitted);
        updateSubmission("");
        sync();
    }

    async function addItemToReceipt() {
        if(!currentReceipt) return;

        const inputElementItemName     = document.getElementById("new-item-name"    ) as HTMLInputElement;
        const inputElementItemCategory = document.getElementById("new-item-category") as HTMLInputElement;
        const inputElementItemPrice    = document.getElementById("new-item-price"   ) as HTMLInputElement;
        const inputElementItemQuantity = document.getElementById("new-item-quantity") as HTMLInputElement;

        const itemName     = inputElementItemName.value;
        const itemCategory = inputElementItemCategory.value;
        const itemPrice    = Number(parseFloat(inputElementItemPrice.value).toFixed(2));
        const itemQuantity = parseInt(inputElementItemQuantity.value);
    

        await instance.post('/addToReceipt', {
            "loginToken" : model.shopper!.loginToken,
            "receiptID"  : currentReceipt.receiptID, // latest receipt
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
                updateAPIMessage({ error: APIMessage.error }); console.log(APIMessage.error);
                return;

            } else {
                updateAPIMessage(APIMessage); console.log(APIMessage);
            
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

    function removeAnalyzedByName(name: string) {
        const itemToRemove = rAnalyzedItems.find(item => item.name === name);
        if (!itemToRemove) return;

        updateAnalyzedItems(items => items.filter(item => item.itemID !== itemToRemove.itemID));
        currentReceipt.items = currentReceipt.items.filter(item => item.itemID !== itemToRemove.itemID);
    }

    async function removeItemFromReceipt() {
        if(!currentReceipt) return;

        const inputElementItemName = document.getElementById("rm-item-name") as HTMLInputElement;
        const itemName             = inputElementItemName.value;

        if(rAnalyzedItems.find(item => item.name === itemName)) {
            removeAnalyzedByName(itemName);
            sync();
            return;
        }

        await instance.post('/removeFromReceipt', {
                "loginToken" : model.shopper!.loginToken,
                "receiptID"  : currentReceipt.receiptID, // latest receipt
                "name"       : itemName
            })
            .then((response : any) => {
                APIMessage = (typeof    (response.data.body) === 'string') ?
                             (JSON.parse(response.data.body)             ) :
                             (           response.data.body              );
                
                if (APIMessage.error != undefined) {
                    updateAPIMessage({ error: APIMessage.error }); console.log(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage      );
                }
            }
        );

        console.log(APIMessage);
        //remove the item from the receipt
        currentReceipt.rmItemByID(APIMessage.itemID);

        //update
        sync();
    }


    async function editItemOnReceipt() {
        if(!currentReceipt) return;

        const nameElement        = document.getElementById("edit-item-name")         as HTMLInputElement;
        const newNameElement     = document.getElementById("edit-item-new_name")     as HTMLInputElement;
        const newCategoryElement = document.getElementById("edit-item-new_category") as HTMLInputElement;
        const newPriceElement    = document.getElementById("edit-item-new_price")    as HTMLInputElement;
        const newQuantityElement = document.getElementById("edit-item-new_quantity") as HTMLInputElement;

        const name               =            nameElement       .value;
        if(!name) return;

        const existingItem       = rAnalyzedItems.find(item => item.name === name)
                   ||        currentReceipt.items.find(item => item.name === name);

        let   newName            =            newNameElement    .value;
        if(!newName) newName = name;
        
        let   newCategory        =            newCategoryElement.value;
        if (!newCategory)     newCategory = existingItem!.category || "";

        let   newPrice           = parseFloat(newPriceElement   .value);
        if (isNaN(newPrice) || newPrice === 0)newPrice = existingItem!.price || 0;

        let   newQuantity        = parseInt  (newQuantityElement.value);
        if(!newQuantity) {
            const itemOfInterest = currentReceipt.items.filter(item => item.name === name);
            newQuantity          = itemOfInterest.length;
        }


        if (rAnalyzedItems.find(item => item.name === name)) {
            const others         = rAnalyzedItems.filter(item => item.name !== name);
            updateAnalyzedItems(others);
            currentReceipt.items = currentReceipt.items.filter((item: { name: string; }) => item.name !== name);

            const updatedItems: Item[] = [];

            for (let i = 0; i < newQuantity; i++) {
                const item = new Item(
                     newCategory,
                    "itemID" + uuidv4(),
                     newName,
                     currentReceipt.receiptID
                );
                item        .setPrice(newPrice);
                updatedItems.push(item);
            }

            updateAnalyzedItems(items => [...items, ...updatedItems]);
            for (let i = 0; i < updatedItems.length; i++) {
                currentReceipt.items.push(updatedItems[i]);
            }

            sync();
            return;
        }


        await instance.post('/editItemOnReceipt',
                {
                    "loginToken" : model.shopper!.loginToken,
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
                    updateAPIMessage({ error: APIMessage.error }); console.log(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage); console.log(APIMessage);
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
       
        const receivedCategory   = APIMessage.category;
        const receivedItemIDs    = APIMessage.itemIDs;
        const receivedName       = APIMessage.name;
        const receivedOldItemIDs = APIMessage.oldItemIDs;
        const receivedPrice      = APIMessage.price;
        const receivedQuantity   = APIMessage.quantity;

        currentReceipt.editItem(
            receivedOldItemIDs,
            receivedCategory,
            receivedItemIDs,
            receivedName,
            receivedQuantity,
            receivedPrice
        );

        sync();
    }


    async function analyzeReceiptImage() {
        const imageElement = document.getElementById("image") as HTMLInputElement;
        const image        = imageElement.files![0];
        if(!image || !currentReceipt) return;

        updateLoadingText("*ChatGPT is thinking*");

        const imageURL = await new Promise<string>((resolve, reject) => {
            const reader   = new FileReader();
            reader.onload  = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(image);
        });

        await instance.post('/analyzeReceiptImage', {
            image     : imageURL,
            loginToken: model.shopper!.loginToken,
            receiptID : currentReceipt.receiptID

        }).then((response: any) => {
            const APIMessage = (typeof    (response.data.body) === 'string') ?
                               (JSON.parse(response.data.body)             ) :
                               (           response.data.body              );

            if (APIMessage.error) {
                updateAPIMessage({ error: APIMessage.error });
                console.log(APIMessage);
                return;
            }

            console.log(APIMessage);

            const summary = (typeof    (APIMessage.summary) === "string") ?
                            (JSON.parse(APIMessage.summary)             ) :
                            (           APIMessage.summary              );
            updateAPIMessage(summary);

            const itemsFromAPI = summary.items || [];

            const newItems   = itemsFromAPI.map((item: any) => {
            const itemBuffer = new Item(
                item.itemCategory,
                "itemID" + uuidv4(),
                item.itemName,
                currentReceipt.receiptID
            );

            itemBuffer          .setPrice(item.itemPrice);

            currentReceipt.items.push(itemBuffer);
            return itemBuffer;
        });

        updateAnalyzedItems(prev => [...prev, ...newItems]);

            updateLoadingText("");
            sync();
        });
    }

    

    async function submitReceipt() {
        if((!currentReceipt)                   ||
           (currentReceipt.items.length === 0) ||
           (rSubmitted)                       ) return;

        for(let i = 0; i < rAnalyzedItems.length; i++) {
            await instance.post('/addToReceipt', {
                "loginToken" : model.shopper!.loginToken,
                "receiptID"  : currentReceipt.receiptID, // latest receipt
                "name"       : rAnalyzedItems[i].name,
                "category"   : rAnalyzedItems[i].category, 
                "price"      : rAnalyzedItems[i].price,
                "quantity"   : 1
            })
            .then((response : any) => {
                APIMessage = (typeof    (response.data.body) === 'string') ?
                             (JSON.parse(response.data.body)             ) :
                             (           response.data.body              );

                if (APIMessage.error != undefined) {
                    updateAPIMessage({ error: APIMessage.error }); console.log(APIMessage.error);
                    return;

                } else {
                    updateAPIMessage(APIMessage); console.log(APIMessage);
                
                }
            });
        }

        currentReceipt.submitted  = true;
        updateSubmitted(currentReceipt.submitted);
        updateSubmission("*Receipt submitted*");
        updateAnalyzedItems([]);

        sync();

        let confetti              = (await import('canvas-confetti')).default;
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
                fontFamily: "sans-serif",
                maxWidth: 600,
                margin: "0 auto",
            }}
        >
            {/* Create Receipt */}
            <section style={{ marginBottom: 24 }}>
                <h3>Create Receipt</h3>
                <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="Store Address" id="store-address" />
                    <input placeholder="Day" id="day" />
                    <input placeholder="Month" id="month" />
                    <input placeholder="Year" id="year" />
                    <button onClick={CreateReceiptController}>Create</button>
                </div>
            </section>

            {/* Analyze Receipt Image */}
            <section style={{ marginBottom: 24 }}>
                <h3>Analyze Receipt Image</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input id="image" type="file" accept="image/*" />
                    <button onClick={analyzeReceiptImage}>Analyze</button>
                    {rLoadingText}
                </div>
            </section>

            {/* Add Item */}
            <section style={{ marginBottom: 24 }}>
                <h3>Add Item</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <input placeholder="Name" id="new-item-name" />
                    <input placeholder="Category" id="new-item-category" />
                    <input placeholder="Price" id="new-item-price" />
                    <input placeholder="Quantity" id="new-item-quantity" />
                    <button onClick={addItemToReceipt}>Add</button>
                </div>
            </section>

            {/* Remove Item */}
            <section style={{ marginBottom: 24 }}>
                <h3>Remove Item</h3>
                <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="Name" id="rm-item-name" />
                    <button onClick={removeItemFromReceipt}>Remove</button>
                </div>
            </section>

            {/* Edit Item */}
            <section style={{ marginBottom: 24 }}>
                <h3>Edit Item</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <input placeholder="Current Name" id="edit-item-name" />
                    <input placeholder="New Name" id="edit-item-new_name" />
                    <input placeholder="New Category" id="edit-item-new_category" />
                    <input placeholder="New Price" id="edit-item-new_price" />
                    <input placeholder="New Quantity" id="edit-item-new_quantity" />
                    <button onClick={editItemOnReceipt}>Save</button>
                </div>
            </section>

            {/* Submit Receipt */}
            <section style={{ marginBottom: 24 }}>
                <h3>Submit Receipt</h3>
                <button onClick={submitReceipt}>Submit</button>
                <div style={{ marginTop: 8 }}>{rSubmission}</div>
            </section>

            {/* Current Receipt */}
            <section style={{ marginBottom: 24 }}>
                <h3>Current Receipt</h3>

                {!rSubmitted && (
                    <>
                        <div>Date: {`${rMonth}/${rDay}/${rYear}`}</div>
                        <div>Chain: {rChainName}</div>
                        <div>Store: {rStoreName}</div>
                    </>
                )}

                <table
                    border={1}
                    cellPadding={8}
                    cellSpacing={0}
                    style={{
                        marginTop: 16,
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                    }}
                >
                    <thead style={{ background: "#008080", color: "white" }}>
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                    {!rSubmitted &&
                        currentReceipt.items.map((item: Item, i: number) => (
                            <tr key={item.itemID}>
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
