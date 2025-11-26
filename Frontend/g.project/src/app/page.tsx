'use client';
import React from 'react';
import styles from './page.module.css';

import { instance } from './aws';
import { ShopperReceiptView } from '../boundary/shopper/shopperReceiptView';

import { AdminDashboard, RemoveStore, RemoveChain } from '../boundary/adminDashboard';
import { LoginAdmin } from '../boundary/loginPage';
import { RegisterShopper, LoginShopper } from '../boundary/shopper/shopperRegister';
import { AddChain, AddStore } from '../boundary/shopper/shopperDashboard';
import { Model } from '../Model';

export default function Home() {
  const [model, updateModel] = React.useState(new Model());
  const [shopper, updateShopper] = React.useState(model.shopper);
  const [view, updateView] = React.useState(0);

  const [redraw, forceRedraw] = React.useState(0);
  const [adminToken, setAdminToken] = React.useState<string | null>(null);

  /** Called when admin logs in */
  const handleLoginSuccess = (token: string) => {
    setAdminToken(token);
  };

  /** Forces rerender after model updates */
  function sync() {
    updateView(view + 1);
    updateModel(model);
    updateShopper(model.shopper);
  }

  function andRefreshDisplay() {
    forceRedraw(redraw + 1);
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div> 
          {!model.shopper?.loginToken && !adminToken ? (
            // No shopper logged in AND no admin logged in
            <div>
              <br />

              <RegisterShopper
                model={model}
                instance={instance}
                andRefreshDisplay={andRefreshDisplay}
              />
              <br />

              <LoginShopper
                model={model}
                instance={instance}
                andRefreshDisplay={andRefreshDisplay}
              /><br></br>

              <LoginAdmin
                instance={instance}
                andRefreshDisplay={andRefreshDisplay}
                onLoginSuccess={handleLoginSuccess}
              />
            </div>
          ) : (
            <div>
              {!adminToken ? (
                // Shopper dashboard
                <div>
                  <h1>{model.shopper && "Welcome, " + model.shopper?.name + "!"}</h1><br></br>

                  <AddChain
                    instance={instance}
                    andRefreshDisplay={andRefreshDisplay}
                    loginToken={model.getLoginToken()}
                  /><br></br>

                  <AddStore
                    instance={instance}
                    andRefreshDisplay={andRefreshDisplay}
                    loginToken={model.getLoginToken()}
                  /><br></br>

                  <ShopperReceiptView
                    model={model}
                    instance={instance}
                    sync={sync}
                  />
                </div>
              ) : (
                // Admin dashboard
                <div>
                  <AdminDashboard instance={instance} adminToken={adminToken} refreshKey={redraw} /><br></br>

                  <RemoveChain
                    instance={instance}
                    andRefreshDisplay={andRefreshDisplay}
                    adminToken={adminToken}
                  />

                  <RemoveStore
                    instance={instance}
                    andRefreshDisplay={andRefreshDisplay}
                    adminToken={adminToken}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
