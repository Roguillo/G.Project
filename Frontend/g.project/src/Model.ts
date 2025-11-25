import { log } from "console"

export class Model {
    shopper: Shopper | undefined
    admin: Admin | undefined
    receipts: Receipt[] | undefined
    shoppingLists: ShoppingList[] | undefined
    chains: Chain[] | undefined
    stores: Store[] | undefined



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
    name: string
    items: Item[]

    constructor(name: string) {
        this.name = name
        this.items = []
    }

    setItems(items: Item[]) {
        this.items = items
    }
}

export class Date {

}

export class Item {

}

export class Chain {

}

export class Store {

}

export class ShoppingList {

}

export class Admin {

}