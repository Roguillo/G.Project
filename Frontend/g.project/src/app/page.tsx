'use client';
import React from 'react';
import styles from './page.module.css';



export default function Home() {
  // const [..., ...] = React.useState(...);

  // if we want something like this to sync React variables
  /*
  const sync = () => {
    updateScreen(...);
    forceRedraw(redraw + 1);
  }
  */

  let screen = </* name of starting screen function */ /* sync={sync}*//>;
  if(/* screen enum value */) {
    screen = </* name of starting screen function */ /* sync={sync}*//>;

    // display auction screen if ongoing
  } else if (/* other screen enum value */) {
    screen = </* name of starting screen function */ /* sync={sync}*//>;

  } else {
    screen = </* name of starting screen function */ /* sync={sync}*//>;
  }


  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {screen}
      </main>
    </div>
  );
}