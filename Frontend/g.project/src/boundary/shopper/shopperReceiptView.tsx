import React from 'react';



export function ShopperReceiptView({ instance, sync } : { instance: any, sync: any }) {
    // react API message state
    const [rAPIMessage, updateAPIMessage] = React.useState();
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


  return (
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
  );
}