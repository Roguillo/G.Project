'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import Image from "next/image";
import styles from "./page.module.css";
import { instance } from './aws'

import { AdminDashboard } from '../boundary/adminDashboard'

export default function Home() {
  const [redraw, forceRedraw] = React.useState(0)
  function andRefreshDisplay() {
   forceRedraw(redraw + 1)
  }

  return (
    <div>
      <AdminDashboard instance = {instance} andRefreshDisplay={andRefreshDisplay}/>
    </div>
  );
}
