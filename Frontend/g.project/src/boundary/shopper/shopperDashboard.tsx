'use client';
import React, { useEffect, useState } from 'react';

export function AddStore({instance, andRefreshDisplay, loginToken}: {instance: any, andRefreshDisplay: any, loginToken: any}){
  const [apiMessage, changeApiMessage] = React.useState("")
  
  async function addStore() {

      const inputElementStoreName = document.getElementById("store-name-to-add") as HTMLInputElement
      const storeName = inputElementStoreName.value
      const inputElementChainName = document.getElementById("store-chain-to-add") as HTMLInputElement
      const chainName = inputElementChainName.value
      const inputElementAddress = document.getElementById("store-address-to-add") as HTMLInputElement
      const address = inputElementAddress.value
    
    
      const response = await instance.post('/addStoreToChain', {
        chainName: chainName,
        storeName: storeName,
        address: address,
        loginToken: loginToken
      });

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        changeApiMessage(message.error);
      } else {
        changeApiMessage("Store Added");  
      }

    andRefreshDisplay();
  }

  return(
    <div>
      <b>Chain Name: </b><input id="store-chain-to-add" placeholder="Chain Name" data-testid="store-chain-to-add"></input>
      <b>Store Name: </b><input id="store-name-to-add" placeholder="Store Name" data-testid="store-name-to-add"></input>
      <b>Store Address: </b><input id="store-address-to-add" placeholder="Store Address" data-testid="store-address-to-add"></input>
      <button onClick={() => {addStore()}}>Add Store</button>
      {apiMessage}

    </div>
  )
}

export function AddChain({instance, andRefreshDisplay, loginToken}: {instance: any, andRefreshDisplay: any, loginToken: any}){
  const [apiMessage, changeApiMessage] = React.useState("")
  
  async function addChain() {

      const inputElementChainName = document.getElementById("chain-name-to-add") as HTMLInputElement
      const chainName = inputElementChainName.value
      const inputElementUrl = document.getElementById("chain-url-to-add") as HTMLInputElement
      const url = inputElementUrl.value
    
      const response = await instance.post('/addChain', {
        loginToken: loginToken,
        chainName: chainName,
        url: url
      });

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        changeApiMessage(message.error);
      } else {
        changeApiMessage("Chain Added");  
      }

    andRefreshDisplay();
  }

  return(
    <div>
      <b>Chain Name: </b><input id="chain-name-to-add" placeholder="Chain Name" data-testid="chain-name-to-add"></input>
      <b>Chain Url: </b><input id="chain-url-to-add" placeholder="Chain Url" data-testid="chain-url-to-add"></input>

      <button onClick={() => {addChain()}}>Add Chain</button>
      {apiMessage}

    </div>
  )
}

export function ListStoreChains({instance, andRefreshDisplay, loginToken}: {instance: any, andRefreshDisplay: any, loginToken: any}){
const [error, setError] = React.useState("");
const [chains, setChains] = React.useState<any[]>([]);
  
  async function listStoreChains() {

      const response = await instance.post('/listStoreChains', {
        loginToken: loginToken
      });

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        setError(message.error);
        setChains([]);
      } else {
        setError("");
        setChains(message);
      }

    andRefreshDisplay();
  }

  return(
    <div>
      <button onClick={listStoreChains}>List Store Chains</button>

      {error && <div>{error}</div>}

      {!error && chains.map((chain) => (
        <div key={chain.chainID}>
          <strong>{chain.chainName}</strong><br />
          URL: {chain.chainUrl}<br />

          <div>
            <strong>Stores:</strong>

            {chain.stores.length === 0 ? (
              <div>
                No stores in this chain.
              </div>
            ) : (
              <ul>
                {chain.stores.map((store: any) => (
                  <li key={store.storeID}>
                    {store.name} — {store.address} - Sales: ${store.sales}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
