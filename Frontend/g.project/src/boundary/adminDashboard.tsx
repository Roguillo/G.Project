'use client';
import React, { useEffect, useState } from 'react';

interface AdminDashboardData {
  totalShoppers: number;
  totalStores: number;
  totalSales: number;
  chains: any[];
  stores: any[];
}

export function AdminDashboard({instance, refreshKey, adminToken}: {instance: any, refreshKey: any, adminToken: any}) {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    
      const response = await instance.post('/showAdminDashboard', {
        adminToken: adminToken
      });

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        setError(message.error);
      } else {
        setDashboard(message);  
      }

  }

  useEffect(() => {
    fetchDashboard();
  }, [refreshKey]);


  // error first
  if (error) return <div>Error: {error}</div>;
  if (!dashboard) return <div>Loading dashboard...</div>

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <p>Total Shoppers:</p> <p>{dashboard.totalShoppers}</p><br />
      <p>Total Stores:</p> <p>{dashboard.totalStores}</p><br />
      <p>Total Sales:</p> <p>${dashboard.totalSales.toFixed(2)}</p><br />

    <p>Chains:</p>
    <ul>
      {dashboard.chains.map((chain: any) => (
        <li key={chain.chainID}>
          Name: {chain.chainName} , Stores: {chain.stores}, Sales: ${chain.totalSales.toFixed(2)}
        </li>
      ))}
    </ul><br />

    <p>Stores:</p>
    <ul>
      {dashboard.stores.map((store: any) => (
        <li key={store.storeID}>
          Name: {store.name} - Address: {store.address} - Chain: {store.chainName}, Sales: ${store.sales.toFixed(2)}
        </li>
      ))}
    </ul>

    </div>
  );
}

export function RemoveStore({instance, andRefreshDisplay, adminToken}: {instance: any, andRefreshDisplay: any, adminToken: any}){
  const [apiMessage, changeApiMessage] = React.useState()
  
  async function removeStore() {

      const inputElementName = document.getElementById("store-name") as HTMLInputElement
      const storeName = inputElementName.value
    
      const response = await instance.post('/removeStore', {
        storeName: storeName,
        adminToken: adminToken
      });

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        changeApiMessage(message.error);
      } else {
        changeApiMessage(message);  
      }

    andRefreshDisplay();
  }

  return(
    <div>
      <b>Store Name: </b><input id="store-name" placeholder="Store Name" data-testid="store-name"></input>
      <button onClick={() => {removeStore()}}>Remove Store</button>

    </div>
  )
}


export function RemoveChain({instance, andRefreshDisplay, adminToken}: {instance: any, andRefreshDisplay: any, adminToken: any}){
  const [apiMessage, changeApiMessage] = React.useState()
  
  async function removeChain() {

      const inputElementName = document.getElementById("chain-name") as HTMLInputElement
      const chainName = inputElementName.value
    
      const response = await instance.post('/removeChain', {
        chainName: chainName,
        adminToken: adminToken
      });

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        changeApiMessage(message.error);
      } else {
        changeApiMessage(message);  
      }

    andRefreshDisplay();
  }

  return(
    <div>
      <b>Chain Name: </b><input id="chain-name" placeholder="Chain Name" data-testid="chain-name"></input>
      <button onClick={() => {removeChain()}}>Remove Chain</button>

    </div>
  )
}