'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import Image from "next/image";
import styles from "./page.module.css";

import { RegisterShopper, LoginShopper } from '../boundary/shopper/shopperRegister.tsx'
import { instance } from './aws'


export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)

  // Helper function that forces React app to redraw whenever this is called.
  function andRefreshDisplay() {
    forceRedraw(redraw + 1)
  }
  
  return (
    <div>
      <h1>A nice template to start with</h1>
      <RegisterShopper instance={instance} andRefreshDisplay={andRefreshDisplay}></RegisterShopper>
    </div>
  );
}
