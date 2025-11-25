import   React   from 'react';
import { Model, Shopper } from '../../Model'



export function ShopperReceiptView({ model, instance, sync } : { model : any, instance: any, sync: any }) {
    // react state variables
    const [rAPIMessage, updateAPIMessage] = React.useState();
    // API message variable
    let     APIMessage : any;
    
    // get date
    const today = new Date();
    const day   = today.getDate();
    const month = today.getMonth() + 1;
    const year  = today.getFullYear();

    
    // create receipt controller
    async function CreateReceiptController() {
        if (!model.shopper) {
            model.shopper = new Shopper("", "", "", "");
        }

        // get login token from model
        model.shopper.loginToken = "test-token1234"; // temporary login token
        const loginToken = model.shopper?.loginToken;


        // get store and chain IDs from shopper
        const StoreIDElement = document.getElementById("store-ID") as HTMLInputElement;
        const ChainIDElement = document.getElementById("chain-ID") as HTMLInputElement;
        const StoreID = StoreIDElement.value;
        const ChainID = ChainIDElement.value;


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
                    APIMessage = (typeof response.data.body === 'string') ? JSON.parse(response.data.body) : response.data.body;
                    
                    if (APIMessage.error != undefined) {
                        updateAPIMessage(APIMessage.error);

                    } else {
                        updateAPIMessage(APIMessage);
                    
                    }
        });

        //update the local model
        model.makeReceipt(APIMessage.receiptID, today)
        
        
        sync();
    }


    async function addItemToReceipt() {
        const inputElementItemName     = document.getElementById("new-item-name")     as HTMLInputElement;
        const inputElementItemCategory = document.getElementById("new-item-category") as HTMLInputElement;
        const inputElementItemPrice    = document.getElementById("new-item-price")    as HTMLInputElement;
        const inputElementItemQuantity = document.getElementById("new-item-quantity") as HTMLInputElement;


        const itemName     = inputElementItemName.value;
        const itemCategory = inputElementItemCategory.value;
        const itemPrice    = inputElementItemPrice.value;
        const itemQuantity = inputElementItemQuantity.value;
        

        await instance.post('/addToReceipt', {
                "loginToken" : model.shopper?.loginToken,
                "receiptID" : "id",
                "name": itemName,
                "category": itemCategory, 
                "price"  :  itemPrice,
                "quantity" : itemQuantity
            })
            .then((response : any) => {
                APIMessage = JSON.parse(response.data.body);
                
                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);

                } else {
                    updateAPIMessage(APIMessage);
                }
            }
        );

        //update model

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

    // ChatGPT for GUI --> prompt: "make it pretty + <html code>" (for the code we already had)
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Input Section */}
            <div style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                <label style={{ marginRight: '10px' }}>
                    <b>Store ID:</b>
                    <input
                    id="store-ID"
                    placeholder="store ID"
                    style={{ marginLeft: '5px', padding: '5px' }}
                    />
                </label>

                <label style={{ marginRight: '10px' }}>
                    <b>Chain ID:</b>
                    <input
                    id="chain-ID"
                    placeholder="chain ID"
                    style={{ marginLeft: '5px', padding: '5px' }}
                    />
                </label>

                <button
                    onClick={() => CreateReceiptController()}
                    style={{ padding: '5px 15px', cursor: 'pointer' }}
                >
                    Create Receipt
                </button>
                </div>

                <div>
                <h4>Current Receipt:</h4>
                <div>Date: {day}</div>
                <div>Month: {month}</div>
                <div>Year: {year}</div>
                {rAPIMessage?.msg && <div style={{ marginTop: '10px', color: 'green' }}>{rAPIMessage.msg}</div>}
                </div>
            </div>

            {/* Receipt View Section */}
            <div>
                <h2>Receipt View</h2>
                <h4>{/* Receipt store */}</h4>
                <h4>{/* Receipt chain */}</h4>
                <h4>{/* Receipt date */}</h4>

                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '15px', marginTop: '20px' }}>
                <thead>
                    <tr>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'left' }}>Category</th>
                    <th style={{ textAlign: 'left' }}>Price</th>
                    </tr>
                </thead>
                {/* <tbody>
                    {rAPIMessage?.map((item: any) => (
                    <tr key={item.ID} style={{ borderBottom: '1px solid #eee' }}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>${item.price}</td>
                    </tr>
                    ))}
                </tbody> */}
                </table>

                {rAPIMessage?.msg && <div style={{ marginTop: '20px', color: 'blue' }}>{rAPIMessage.msg}</div>}
            </div>
        </div>
    );
}