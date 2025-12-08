import React from 'react'

export function CreateShoppingList({model, shoppingList, setShoppingList, instance, andRefreshDisplay}: {model: any, shoppingList:any, setShoppingList:any, instance: any, andRefreshDisplay: any}) {
    type ShoppingListMessage = {
        listName?: string;
        items?: string[];
        error?: string;
    } | null;
    const [apiMessage, changeApiMessage] = React.useState<ShoppingListMessage>();

    async function createShoppingList() {
        andRefreshDisplay()

        const inputElementListName = document.getElementById("list-name-to-add") as HTMLInputElement
        const listName = inputElementListName.value


        const response = await instance.post('/createShoppingList', {
            loginToken: model.getLoginToken(),
            shoppingListName: listName
        });

        const message = JSON.parse(response.data.body);
        console.log(message);

        if (message.error != undefined) {
            changeApiMessage({ error: message.error });
        } else {
            changeApiMessage({
                listName: message.shoppingListName,
                items: message.items
            }); 
            setShoppingList({
                name: message.shoppingListName,
                items: message.items || []
            })
        }


        andRefreshDisplay()
    }

    return(
    <div>
      <b>List Name: </b><input id="list-name-to-add" placeholder="List Name" data-testid="list-name-to-add"></input>

      <button onClick={() => {createShoppingList()}}>Create Shopping List</button>
      
        {/* Display list name and items */}
        {apiMessage && !apiMessage.error && (
        <div>
            <h3>{apiMessage.listName}</h3>
            {shoppingList.items.length > 0 ? (
            <ul>
                {shoppingList.items.map((item : any)=> (
                <li key={item.itemID}>
                {item.name} ({item.category})
                </li>
            ))}
            </ul>
            ) : (
            <p><i>No items yet</i></p>
            )}
        </div>
        )}

        {/* Display error */}
        {apiMessage?.error && (
        <div>{apiMessage.error}</div>
        )}
        </div>
    )
}

export function AddItemShoppingList({model, shoppingList, setShoppingList, instance, andRefreshDisplay}: {model: any, shoppingList:any, setShoppingList:any, instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState("");

    async function addItemShoppingList() {
        andRefreshDisplay()

        const inputElementItemName = document.getElementById("item-name-to-add") as HTMLInputElement
        const itemName = inputElementItemName.value
        const inputElementItemCategory = document.getElementById("item-category-to-add") as HTMLInputElement
        const itemCategory = inputElementItemCategory.value


        const response = await instance.post('/addItemShoppingList', {
            loginToken: model.getLoginToken(),
            listName: shoppingList.name,
            itemName: itemName,
            itemCategory: itemCategory
        });

        const message = JSON.parse(response.data.body);
        console.log(message);

        if (message.error != undefined) {
            changeApiMessage(message.error);
        } else {
            changeApiMessage("Item Added"); 
            setShoppingList((prev: any) => ({
            ...prev,
            items: message.items
        }));
        }

        andRefreshDisplay()
    }

    return(
    <div>
      <b>Item Name: </b><input id="item-name-to-add" placeholder="Item Name" data-testid="item-name-to-add"></input>
      <b>Item Category: </b><input id="item-category-to-add" placeholder="Item Category" data-testid="item-category-to-add"></input>
      <button onClick={() => {addItemShoppingList()}}>Add Item</button>
    </div>
    )
}

export function ReportOptionsShoppingList({model, shoppingList, setShoppingList, instance, andRefreshDisplay}: {model: any, shoppingList:any, setShoppingList:any, instance: any, andRefreshDisplay: any}) {
    const [apiMessage, changeApiMessage] = React.useState("");

    async function reportOptionsShoppingList(){
        andRefreshDisplay()
        
        const response = await instance.post('/reportOptionsShoppingList', {
            shoppingListName: shoppingList.name,
            loginToken: model.getLoginToken()
        })

        const message = JSON.parse(response.data.body);
        console.log(message);

        if (message.error != undefined) {
            changeApiMessage(message.error);
        } else{
            const optionList =
            message.options?.flatMap((group: { options: any; }) => group.options) ?? [];

            const formatted = optionList
                .map((opt: any) => {
                    
                    if (opt.missing || !opt.store || opt.store.length === 0) {
                        return `${opt.itemName} — Item does not exist in database`;
                    }

                    const storeName = opt.store[0].name ?? "Unknown Store";
                    return `${opt.itemName} (${opt.itemCategory}) — Store Name: ${storeName} — $${opt.price}`;
                })
                .join("\n");

            changeApiMessage(formatted);
        }

        andRefreshDisplay()
    }

    return(
    <div>
      <button onClick={() => {reportOptionsShoppingList()}}>Report Options For Purchase</button>
      <pre>{apiMessage}</pre>
    </div>
    )
}