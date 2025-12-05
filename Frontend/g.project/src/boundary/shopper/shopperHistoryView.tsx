import React from 'react'

function ReviewHistory({model, instance, andRefreshDisplay}: {model: any, instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState<string>()
    const [receiptData, changeReceiptData] = React.useState([])

    function reviewHistory() {
        andRefreshDisplay()

        instance.post('/reviewHistory', {
                "loginToken": "test-token1234"
            })
            .then((response: any) => {
                let message = JSON.parse(response.data.body)
                if (response.data.statusCode == 400) {
                    changeApiMessage("Not logged into account")
                } else {
                    changeApiMessage(undefined)
                    changeReceiptData(message.receiptData)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                }
            })

        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay()
    }

    return (
        <div>
          <h2>Review History</h2>
          <button onClick={() => {reviewHistory()}}>Review History</button><br></br>
          <ul>
            {receiptData.map((receipt: any) => (
              <li key={receipt.receiptID}>{"Date: " + receipt.date.slice(0, 10) + "  | Chain: " + receipt.chainID + "  | Store: " + receipt.storeID}
                <ul>
                    {receipt.items.map((item: any) => (
                        <li key={item.itemID}>{"Item: " + item.name + "  | Category: " + item.category + "  | Price: " + item.price}</li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
          {apiMessage}
        </div>
    )
}


function ReviewActivity({model, instance, andRefreshDisplay}: {model: any, instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState<string>()
    const [receiptData, changeReceiptData] = React.useState([])


    function reviewActivity() {

        const inputDaysPrior = document.getElementById("days-prior") as HTMLInputElement

        const daysPrior = parseInt(inputDaysPrior.value)

        if (daysPrior < 0) {
            changeApiMessage("Enter a value >= 0")
            return
        }

        instance.post('/reviewActivity', {
                "loginToken": "test-token1234",
                "daysPrior": daysPrior
            })
            .then((response: any) => {
                let message = JSON.parse(response.data.body)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                if (response.data.statusCode == 400) {
                    changeApiMessage("Not logged into account")
                } else {
                    if (message.receiptData.length == 0) {
                        changeApiMessage("No receipts in specified timeframe")
                    } else {
                        changeApiMessage(undefined)
                        changeReceiptData(message.receiptData)
                    }
                }
            })

        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay()
    }

    return (
        <div>
          <h2>Review Activity</h2>
          <b>Days Prior: </b><input id="days-prior" placeholder="Days Prior" data-testid="days-prior"></input>
          <button onClick={() => {reviewActivity()}}>Review Activity</button><br></br>
          {apiMessage}<br></br>
          <ul>
            {receiptData.map((receipt: any) => (
              <li key={receipt.receiptID}>{"Date: " + receipt.date.slice(0, 10) + "  | Chain: " + receipt.chainID + "  | Store: " + receipt.storeID}
                <ul>
                    {receipt.items.map((item: any) => (
                        <li key={item.itemID}>{"Item: " + item.name + "  | Category: " + item.category + "  | Price: " + item.price}</li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
    )
}

function SearchRecentPurchases({model, instance, andRefreshDisplay}: {model: any, instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState()

    function loginShopper() {

        const inputElementUsername = document.getElementById("shopper-username") as HTMLInputElement
        const inputElementPassword = document.getElementById("shopper-password") as HTMLInputElement

        const username = inputElementUsername.value
        const password = inputElementPassword.value
        let name: string
        let loginToken:string

        instance.post('/loginShopper', {
                "username": username,
                "password": password
            })
            .then((response: any) => {
                let message = JSON.parse(response.data.body)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                if (message.error != undefined) {
                    changeApiMessage(message.error)
                    andRefreshDisplay()
                } else {
                    model.loginShopper(message.name, username, password, message.loginToken)
                    changeApiMessage(message.body)
                    andRefreshDisplay()
                }
            })
    }

    return (
        <div>
          <h2>Login to Account</h2>
          <b>Username: </b><input id="shopper-username" placeholder="Username" data-testid="shopper-username"></input>
          <button onClick={() => {loginShopper()}}>Login to Account</button>

          <p><b>Password: </b><input id="shopper-password" placeholder="Password" data-testid="shopper-password"></input></p>

          <br></br>
          {apiMessage}
          
        </div>
    )
}

export { ReviewHistory, ReviewActivity, SearchRecentPurchases }