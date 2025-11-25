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
    shopper: Shopper | undefined
    admin: Admin | undefined
    receipts: Receipt[] | undefined
    shoppingLists: ShoppingList[] | undefined
    chains: Chain[] | undefined
    stores: Store[] | undefined


    constructor(){
        this.shopper = undefined
        this.admin = undefined
        this.receipts = undefined
        this.shoppingLists = undefined
        this.chains = undefined
        this.stores = undefined
    }

    loginShopper(name: string, username: string, password: string, loginToken: string) {
        this.shopper = new Shopper(name, username, password, loginToken)

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
    receiptID: string
    name: string
    items: Item[]
    date: Date | undefined

    constructor(rcptID: string, name: string) {
        this.receiptID = rcptID
        this.name = name
        this.items = []
    }

    setItems(items: Item[]) {
        this.items = items
    }

    addItem(item: Item){
        this.items.push(item)
    }

    rmItem(item: Item){
        this.items = this.items.filter(items => items !== item)
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
    itemID: string
    name: string
    category: string
    price: number | undefined
    store: Store | undefined

    constructor(itemID:string, name: string, category: string) {
        this.itemID = itemID
        this.name = name
        this.category = category
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
    items: Item[]

    constructor(name: string) {
        this.name = name
        this.items = []
    }

    addItem(items: Item[]) {
        this.items = items
    }
}

export class Admin {
    name: string
    username: string
    password: string
    adminToken: string

    constructor(name: string, username: string, password: string, adminToken, string) {
        this.name = name
        this.username = username
        this.password = password
        this.adminToken = adminToken
    }
}