'use client';
import React from 'react';
import styles from './page.module.css';

import { ReceiptView } from '../boundary/shopper/shopperReceiptView.tsx'
import { instance } from './aws'

import { AdminDashboard, RemoveStore, RemoveChain } from '../boundary/adminDashboard'
import { LoginAdmin } from '../boundary/loginPage'
import { RegisterShopper, LoginShopper } from '../boundary/shopper/shopperRegister'
import { AddChain, AddStore } from '../boundary/shopper/shopperDashboard'
import { Model } from '../Model'

export default function Home() {
  const [model, setModel] = React.useState(new Model())
  const [redraw, forceRedraw] = React.useState(0)
  const [adminToken, setAdminToken] = React.useState<string | null>(null);

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
  }

  function andRefreshDisplay() {
   forceRedraw(redraw + 1)
  }
      
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          {!model.shopper?.loginToken && !adminToken ? (
            // Render shopper and admin login first if no loginToken or adminToken
            <div>
              <h1>{model.shopper && "Welcome back " + model.shopper?.name}</h1><br></br>
              <RegisterShopper model={model} instance={instance} andRefreshDisplay={andRefreshDisplay}></RegisterShopper><br></br>
              <LoginShopper model={model} instance={instance} andRefreshDisplay={andRefreshDisplay}></LoginShopper>
              <LoginAdmin instance={instance} andRefreshDisplay={andRefreshDisplay} onLoginSuccess={handleLoginSuccess} />
            </div>
          ) : (
            <div>
              {!adminToken ? (
                <div>
                <h1>This is the shopper dashboard</h1>
                <AddChain instance={instance} andRefreshDisplay={andRefreshDisplay} loginToken={model.getLoginToken()} />
                <AddStore instance={instance} andRefreshDisplay={andRefreshDisplay} loginToken={model.getLoginToken()} />
                </div>

              ) : (
                <div>
                  <AdminDashboard instance={instance} adminToken={adminToken} refreshKey = {redraw}/>
                  <RemoveChain instance={instance} andRefreshDisplay={andRefreshDisplay} adminToken={adminToken} />
                  <RemoveStore instance={instance} andRefreshDisplay={andRefreshDisplay} adminToken={adminToken} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
