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
                console.log(message)
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
          <button onClick={() => {reviewHistory()}}>Review History</button>
          <ul>
            {receiptData.map((receipt: any) => (
              <li key={receipt.receiptID}>
                <b>{"Receipt purchased from " + receipt.chainName + " at " + receipt.storeName + " (" + receipt.address + ") on " + receipt.date.slice(0, 10) + " | Total: $" + receipt.totalCost}</b>
                <ul>
                    {receipt.items.map((item: any) => (
                        <li key={item.itemID}>{"Item: " + item.name + " (" + item.category + ") | $" + item.price}</li>
                    ))}
                </ul><br/>
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
        const inputActivityPeriod = document.getElementById("activity-period") as HTMLInputElement
        const activityPeriod = inputActivityPeriod.value

        instance.post('/reviewActivity', {
                "loginToken": model.getLoginToken(),
                "activityPeriod": activityPeriod
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
            {/* <b>Days Prior: </b><input id="days-prior" placeholder="Days Prior" data-testid="days-prior"></input> */}
            <select name="activity-period" id="activity-period">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>

            <button onClick={() => {reviewActivity()}}>Review Activity</button><br/>
            {apiMessage}<br></br>

            <ul>
                {receiptData.map((receiptData: any) => (
                <li key={receiptData.startDate}>
                    <h3>{"From " + receiptData.startDate.slice(0, 10) + " to " + receiptData.endDate.slice(0, 10)}</h3>
                    <b>{receiptData.receipts.length == 0 && "No receipts in this timeframe"}</b>
                    <ul>
                        {receiptData.receipts.map((receipt: any) => (
                        <li key={receipt.receiptID}>
                            <b>{"Receipt purchased from " + receipt.chainName + " at " + receipt.storeName + " (" + receipt.storeAddress + ") on " + receipt.date.slice(0, 10) + " | Total: $" + receipt.totalCost}</b>
                            <ul>
                                {receipt.items.map((item: any) => (
                                    <li key={item.itemID}>
                                        {"Item: " + item.name + " (" + item.category + ") | $" + item.price}
                                    </li>
                                ))}
                            </ul><br/>
                        </li>
                        ))}
                    </ul><br/>
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
              <li key={item.itemID}>{"Item: " + item.name + " (" + item.category + ") | $" + item.price + " | Purchased from " + item.chainName + " at " + item.storeName + " (" + item.address + ") on " + item.date.slice(0, 10)}</li>
            ))}
          </ul>
        </div>
    )
}

export { ReviewHistory, ReviewActivity, SearchRecentPurchases }