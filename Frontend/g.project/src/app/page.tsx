'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import Image from "next/image";
import styles from "./page.module.css";

import { RegisterShopper } from './boundary'


export default function Home() {
  return (
    <div>
      <h1>A nice template to start with</h1>
    </div>
  );
}
