'use client';
import React from 'react';
import styles from './page.module.css';

import { instance } from './aws'
import { ShopperReceiptView } from '../boundary/shopper/shopperReceiptView'
import { Model } from '../Model'



export default function Home() {
  const [view, updateView] = React.useState(0)
  const [model, updateModel] = React.useState(new Model());
  const [shopper, updateShopper] = React.useState(model.shopper);

  function sync() {
    updateView(view + 1);
    updateModel(model);
    updateShopper(model.shopper);
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
        <ShopperReceiptView model={model} instance={instance} sync={sync}></ShopperReceiptView>
        {/* {screen} */}
      </main>
    </div>
  )
}
