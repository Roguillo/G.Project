'use client';
import React, { useEffect, useState } from 'react';

interface AdminDashboardData {
  totalShoppers: number;
  totalStores: number;
  totalSales: number;
  chains: any[];
  stores: any[];
}

export function AdminDashboard({instance, andRefreshDisplay}: {instance: any, andRefreshDisplay: any}) {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    
      const response = await instance.post('/showAdminDashboard', {
        adminToken: 'adminTokenTest'
      });

      const message = JSON.parse(response.data.body);
      console.log(message);

      if (message.error != undefined) {
        setError(message.error);
      } else {
        setDashboard(message);  
      }

    andRefreshDisplay();
  }

  useEffect(() => {
    fetchDashboard();
  }, []);


  // error first
  if (error) return <div>Error: {error}</div>;
  if (!dashboard) return <div>Loading dashboard...</div>

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <p>Total Shoppers:</p> {dashboard.totalShoppers}
      <p>Total Stores:</p> {dashboard.totalStores}
      <p>Total Sales:</p> ${dashboard.totalSales.toFixed(2)}

    <p>Chains:</p>
    <ul>
      {dashboard.chains.map((chain: any) => (
        <li key={chain.chainID}>
          Name: {chain.chainName} , Stores: {chain.stores}, Sales: ${chain.totalSales.toFixed(2)}
        </li>
      ))}
    </ul>

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