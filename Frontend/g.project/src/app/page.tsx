'use client';
import React from 'react';
import styles from './page.module.css';

import { instance } from './aws'
import { ShopperReceiptView } from '../boundary/shopper/shopperReceiptView'



export default function Home() {
  const [view, updateView] = React.useState(0)

  function sync() {
    updateView(view + 1);
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
        <ShopperReceiptView instance={instance} sync={sync}></ShopperReceiptView>
        {/* {screen} */}
      </main>
    </div>
  )
}
