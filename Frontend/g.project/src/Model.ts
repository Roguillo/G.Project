import { log } from "console"


export enum currentView{
    login,
    shopperDash,
    shopperRcpt,
    shopperHist,
    shopperList,
    adminDash
}

export class Model {
    shopper      : Shopper | undefined;
    admin        : Admin | undefined;
    receipts     : Receipt[];
    shoppingLists: ShoppingList[];
    chains       : Chain[];
    stores       : Store[];


    constructor(){
        this.shopper       = undefined;
        this.admin         = undefined;
        this.receipts      = [];
        this.shoppingLists = [];
        this.chains        = [];
        this.stores        = [];
    }

    loginShopper(name: string, username: string, password: string, loginToken: string) {
        this.shopper = new Shopper(name, username, password, loginToken)

    }


    pickReceipt(receiptID:any){
        if(this.receipts === undefined) return(null);

        //ChatGPT query: "what function should I use to pick a specific item out of an array in javascript? 
        // I have an array of receipt objects, and I need to pick one out by its receiptID field. 
        // Every receipt has a unique id"
        else return(this.receipts.find(receipt => receipt.receiptID === receiptID));
    }

    getLoginToken() {
        return this.shopper?.loginToken
    }
    
    makeSL(name:string, shoppingListID:string){
        let newSL = new ShoppingList(name, shoppingListID);
        this.shoppingLists.push(newSL)
    }

    makeReceipt(chainID: string, date : Date, receiptID: string, storeID: string){
        let newRcpt = new Receipt(chainID, date, receiptID, storeID);
        newRcpt.setDate(date)
        this.receipts.push(newRcpt)
    }

    addItemToReceipt(category : string, itemID : string, name : string, receiptID : string) {
        this.receipts[this.receipts.length - 1].addItem(new Item(
            category, itemID, name, receiptID)
        );
    }
}

export class Shopper {
    loginToken: string
    name: string
    username: string
    password: string

    constructor(name: string, username: string, password: string, loginToken: string) {
        this.name = name
        this.username = username
        this.password = password
        this.loginToken = loginToken
    }
}

export class Receipt {
    chainID       : string;
    date          : Date | undefined;
    items         : Item[];
    receiptID     : string;
    storeID       : string;
    submitted     : boolean;

    constructor(chainID: string, date : Date, receiptID: string, storeID: string) {
        this.chainID       = chainID;
        this.date          = date;
        this.items         = [];
        this.receiptID     = receiptID;
        this.storeID       = storeID;
        this.submitted     = false;
    }

    setItems(items: Item[]) {
        this.items = items
    }

    addItem(item: Item) {
        this.items.push(item)
    }

    rmItem(item: Item) {
        this.items = this.items.filter(items => items !== item)
    }

    rmItemByID(ID:string) {
        this.items = this.items.filter(item => item.itemID !== ID)
        console.log(this.items)
    }

    editItem(oldItemIDs : string[], category : string, itemIDs : string[], name : string, quantity : number, price : number) {
        let itemID : string;
        
        for(let i = 0; i < oldItemIDs.length; i++) {
            this.rmItemByID(oldItemIDs[i]);
        }

        if(oldItemIDs.length > 0) {
            for(let i = 0; i < quantity; i++) {
                itemID = itemIDs[i];
                this.addItem(new Item(category, itemID, name, this.receiptID));
                this.items[this.items.length - 1].setPrice(price);
            }
        }   
    }

    setDate(date: Date) {
        this.date = date
    }
}

export class Date {
    day: number
    month: number
    year: number

    constructor(day: number, month: number, year: number) {
        this.day = day
        this.month = month
        this.year = year
    }

}

export class Item {
    category  : string;
    itemID    : string;
    name      : string;
    price     : number | undefined;
    receiptID : string | undefined;
    shoppingListID : string | undefined;
    store     : Store | undefined;

    constructor( category : string, itemID : string, name : string, receiptID : string) {
        this.category  = category;
        this.itemID    = itemID;
        this.name      = name;
        this.receiptID = receiptID;
    }

    setSLID(shoppingListID: string) {
        this.shoppingListID = shoppingListID
    }

    setPrice(price: number) {
        this.price = price
    }

    setStore(store: Store) {
        this.store = store
    }
}

export class Chain {
    name: string
    url: string
    stores: Store[]
    sales: number | undefined

    constructor(name: string, url: string) {
        this.name = name
        this.url = url
        this.stores = []
    }

    addStore(store: Store) {
        this.stores.push(store)
    }

    addSales(sales: number) {
        this.sales = sales
    }
}

export class Store {
    name: string
    address: string
    chainName: string
    sales: number | undefined

    constructor(name: string, address: string, chainName: string) {
        this.name = name
        this.address = address
        this.chainName = chainName
    }

    addSales(sales: number) {
        this.sales = sales
    }
}

export class ShoppingList {
    name: string
    shoppingListID: string
    items: Item[]

    constructor(name: string, shoppingListID: string) {
        this.name = name
        this.shoppingListID = shoppingListID
        this.items = []
    }

    addItem(items: Item[]) {
        this.items = items
    }

    addNewItem(item: Item) {
        this.items.push(item)
    }
}

export class Admin {
    name: string
    username: string
    password: string
    adminToken: string

    constructor(name: string, username: string, password: string, adminToken : string) {
        this.name = name
        this.username = username
        this.password = password
        this.adminToken = adminToken
    }
}