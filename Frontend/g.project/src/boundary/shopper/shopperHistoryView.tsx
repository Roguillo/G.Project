import React from 'react'

function ReviewHistory({model, instance, andRefreshDisplay}: {model: any, instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState<string>()
    const [receiptData, changeReceiptData] = React.useState([])

    function reviewHistory() {
        andRefreshDisplay()

        instance.post('/reviewHistory', {
                "loginToken": model.getLoginToken()
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
                "loginToken": model.getLoginToken(),
                "daysPrior": daysPrior
            })
            .then((response: any) => {
                let message = JSON.parse(response.data.body)  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
                console.log(message)
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
              <li key={receipt.receiptID}>{"Receipt from " + receipt.date.slice(0, 10) + " at chain \"" + receipt.chainID + "\" and store \"" + receipt.storeID + "\""}
                <ul>
                    {receipt.items.map((item: any) => (
                        <li key={item.itemID}>{"Item: " + item.name + "  | Category: " + item.category + "  | Price: " + item.price}</li>
                    ))}
                </ul><br />
              </li>
            ))}
          </ul>
        </div>
    )
}

function SearchRecentPurchases({model, instance, andRefreshDisplay}: {model: any, instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState<string>()
    const [itemData, changeItemData] = React.useState([])

    function searchRecentPurchases() {

        const inputSearchField = document.getElementById("search-field") as HTMLInputElement

        const searchField = inputSearchField.value

        instance.post('/searchRecentPurchases', {
                "loginToken": model.getLoginToken(),
                "searchField": searchField
            })
            .then((response: any) => {
                let message = JSON.parse(response.data.body)
                console.log(message.itemData)
                if (response.data.statusCode == 400) {
                    changeApiMessage("Not logged into account")
                } else {
                    if (message.itemData.length == 0) {
                        changeApiMessage("No purchased items with specified name")
                    } else {
                        changeApiMessage(undefined)
                        changeItemData(message.itemData)
                    }
                }
            })

        // in case any parent React code needs to know about this change, call the passed-in function
        andRefreshDisplay()
    }

    return (
        <div>
          <h2>Search Recent Purchases</h2>
          <b>Item Name: </b><input id="search-field" placeholder="Item Name" data-testid="search-field"></input>
          <button onClick={() => {searchRecentPurchases()}}>Search Item</button><br></br>
          {apiMessage}<br></br>
          <ul>
            {itemData.map((item: any) => (
              <li key={item.itemID}>{"Name: " + item.name + "  | Category: " + item.category + "  | Price: " + item.price + "  | Date: " + item.date.slice(0, 10)}</li>
            ))}
          </ul>
        </div>
    )
}

export { ReviewHistory, ReviewActivity, SearchRecentPurchases }