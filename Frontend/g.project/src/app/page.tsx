'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import Image from "next/image";
import styles from "./page.module.css";
import { instance } from './aws'

import { AdminDashboard, RemoveStore, RemoveChain } from '../boundary/adminDashboard'
import { LoginAdmin } from '../boundary/loginPage'
import { AddChain, AddStore } from '../boundary/shopper/shopperDashboard'

export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)
  const [adminToken, setAdminToken] = React.useState<string | null>(null);

  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
  }

  function andRefreshDisplay() {
   forceRedraw(redraw + 1)
  }

  return (
    <div>
      {!adminToken ? (
        // Render login first if no token
        <LoginAdmin instance={instance} andRefreshDisplay={andRefreshDisplay} onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Render dashboard once token is available
        <div>
        <AdminDashboard instance={instance} adminToken={adminToken} refreshKey = {redraw}/>
        <RemoveChain instance={instance} andRefreshDisplay={andRefreshDisplay} adminToken={adminToken} />
        <RemoveStore instance={instance} andRefreshDisplay={andRefreshDisplay} adminToken={adminToken} />
        <AddChain instance={instance} andRefreshDisplay={andRefreshDisplay} loginToken={'test-token1234'} />
        <AddStore instance={instance} andRefreshDisplay={andRefreshDisplay} loginToken={'test-token1234'} />
        </div>
      )}
'use client';
import React from 'react';
import styles from './page.module.css';

import { RegisterShopper, LoginShopper } from '../boundary/shopper/shopperRegister.tsx'
import { instance } from './aws'
import { Model } from '../Model'


export default function Home() {
  const [model, setModel] = React.useState(new Model())
  const [redraw, forceRedraw] = React.useState(0)

  // const [..., ...] = React.useState(...);

  // if we want something like this to sync React variables
  /*
  const sync = () => {
    updateScreen(...);
    forceRedraw(redraw + 1);
  }
  */
  
  // Helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }
  
  // let screen = </* name of starting screen function */ /* sync={sync}*//>;
  // if(/* screen enum value */) {
  //   screen = </* name of starting screen function */ /* sync={sync}*//>;

  //   // display auction screen if ongoing
  // } else if (/* other screen enum value */) {
  //   screen = </* name of starting screen function */ /* sync={sync}*//>;

  // } else {
  //   screen = </* name of starting screen function */ /* sync={sync}*//>;
  // }
    
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <h1>{model.shopper && "Welcome back " + model.shopper?.name}</h1><br></br>
          <RegisterShopper model={model} instance={instance} andRefreshDisplay={andRefreshDisplay}></RegisterShopper><br></br>
          <LoginShopper model={model} instance={instance} andRefreshDisplay={andRefreshDisplay}></LoginShopper>
        </div>
      </main>
    </div>
  )
}
