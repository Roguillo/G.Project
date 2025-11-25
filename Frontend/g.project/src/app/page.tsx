'use client'                              // directive to clarify client-side. Place at top of ALL .tsx files
import React from 'react'
import Image from "next/image";
import styles from "./page.module.css";
import { instance } from './aws'

import { AdminDashboard } from '../boundary/adminDashboard'
import { LoginAdmin } from '../boundary/loginPage'

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
        <AdminDashboard instance={instance} andRefreshDisplay={andRefreshDisplay} adminToken={adminToken} />
      )}
    </div>
  );
}
