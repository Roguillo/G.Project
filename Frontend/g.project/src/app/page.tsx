'use client';
import React from 'react';
import styles from './page.module.css';

import { RegisterShopper, LoginShopper } from '../boundary/shopper/shopperRegister.tsx'
import { instance } from './aws'
import { Model } from '../model'


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
