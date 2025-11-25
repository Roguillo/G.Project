import React from 'react'
import {Model} from '../../Model'

function ReceiptView({instance, andRefreshDisplay}: {instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState()
    const [model, updateModel] = React.useState(Model)

    function addItemToReceipt() {

        const inputElementUsername = document.getElementById("new-shopper-username") as HTMLInputElement
        const inputElementPassword = document.getElementById("new-shopper-password") as HTMLInputElement

        const username = inputElementUsername.value
        const password = inputElementPassword.value

        instance.post('/addToReceipt', {
                "username": username,
                "password": password
            })
            .then((response) => {
                let message = JSON.parse(response.data.body)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                
                if (message.error != undefined) {
                    changeApiMessage(message.error)
                } else {
                    changeApiMessage(message)
                }
            })

        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay()
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
                {apiMessage.map((item:any) => (
                    <tr key = {item.ID}>
                    <td>{item.name}</td>
                    <td>${item.category}</td>
                    <td>{item.price}</td>
                    </tr>
                ))}
                </tbody>
            </table>


        

          <br></br>
          {apiMessage}
          
        </div>
    )
}




export { ReceiptView }