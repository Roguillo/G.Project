import  React from 'react';
import {Model} from '../../Model'



export function ShopperReceiptView({ instance, sync } : { instance: any, sync: any }) {
    // react state variables
    const [rAPIMessage, updateAPIMessage] = React.useState();
    const [model      , updateModel     ] = React.useState(new Model());
    // API message variable
    let     APIMessage;
    
    // get date
    const today = new Date();
    const day   = today.getDate();
    const month = today.getMonth() + 1;
    const year  = today.getFullYear();

    
    // create receipt controller
    function CreateReceiptController() {
        // get login token from model
        const loginToken = "test-token1234"; //TODO: get from model


        // get store and chain IDs from shopper
        const StoreIDElement = document.getElementById("store-ID") as HTMLInputElement;
        const ChainIDElement = document.getElementById("chain-ID") as HTMLInputElement;
        const StoreID = StoreIDElement.value;
        const ChainID = ChainIDElement.value;


        instance.post('/createReceipt', 
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
                    APIMessage = JSON.parse(response.data.body)
                    
                    if (APIMessage.error != undefined) {
                        updateAPIMessage(APIMessage.error);

                    } else {
                        updateAPIMessage(APIMessage);
         
                    }
        });

        sync();
    }


    function addItemToReceipt() {
        const inputElementItemName     = document.getElementById("new-item-name")     as HTMLInputElement;
        const inputElementItemCategory = document.getElementById("new-item-category") as HTMLInputElement;
        const inputElementItemPrice    = document.getElementById("new-item-price")    as HTMLInputElement;
        const inputElementItemQuantity = document.getElementById("new-item-quantity") as HTMLInputElement;


        const itemName     = inputElementItemName.value;
        const itemCategory = inputElementItemCategory.value;
        const itemPrice    = inputElementItemPrice.value;
        const itemQuantity = inputElementItemQuantity.value;

        instance.post('/addToReceipt', {
                "loginToken" : model.shopper?.loginToken,
                "name": itemName,
                "category": itemCategory,

            })
            .then((response : any) => {
                APIMessage = JSON.parse(response.data.body);
                
                if (APIMessage.error != undefined) {
                    updateAPIMessage(APIMessage.error);

                } else {
                    updateAPIMessage(APIMessage);
                }
            });

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
    return (
        <div>
        <div>
            <b>store ID: </b><input id="store-ID" placeholder="store ID"></input>
            <b>chain ID: </b><input id="chain-ID" placeholder="chain ID"></input>
            <button onClick={() => {CreateReceiptController()}}>create receipt</button>
            <div>Current Receipt:</div>
            <div>Date: { day }</div>
            <div>Month: { month }</div>
            <div>Year: { year }</div>
            {rAPIMessage}
        </div>

                <div>
            <h2>Receipt View</h2>
            <h4> {/*receipt store*/} </h4>
            <h4> {/*receipt chain*/} </h4>
            <h4>{/*receipt date*/}</h4>

            <table style={{ borderSpacing: '15px' }}>
                <thead>
                <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                </tr>
                </thead>
                <tbody>
                {rAPIMessage.map((item:any) => (
                    <tr key = {item.ID}>
                    <td>{item.name}</td>
                    <td>${item.category}</td>
                    <td>{item.price}</td>
                    </tr>
                ))}
                </tbody>
            </table>

          <br></br>
          {rAPIMessage}
          
        </div>
        </div>
    );
}