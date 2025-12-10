'use client';
import React from 'react';
import styles from './page.module.css';

import { instance } from './aws';
import { ShopperReceiptView } from '../boundary/shopper/shopperReceiptView';
import { AddItemShoppingList, RemoveItemShoppingList, CreateShoppingList, ReportOptionsShoppingList } from '../boundary/shopper/shopperListVew';
import { AdminDashboard, RemoveStore, RemoveChain } from '../boundary/adminDashboard';
import { LoginAdmin } from '../boundary/loginPage';
import { RegisterShopper, LoginShopper } from '../boundary/shopper/shopperRegister';
import { AddChain, AddStore, ListStoreChains } from '../boundary/shopper/shopperDashboard';
import { ReviewActivity, ReviewHistory, SearchRecentPurchases } from '../boundary/shopper/shopperHistoryView';
import { Model } from '../Model';


export default function Home() {
  const [model, updateModel] = React.useState(new Model());
  const [shoppingList, setShoppingList] = React.useState({ id: "", name: "", items: [] });
  const [shopper, updateShopper] = React.useState(model.shopper);
  const [view, updateView] = React.useState(0);

  const [redraw, forceRedraw] = React.useState(0);
  const [adminToken, setAdminToken] = React.useState<string | null>(null);

  const [shopperView, setShopperView] = React.useState("dashboard");
  // can be: "dashboard" | "receipts" | "shoppingList" | "history"

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
    <div>
      {/* LOGIN / REGISTER SCREEN */}
      {!model.shopper?.loginToken && !adminToken ? (
        <div>
          <h1>{model.shopper && "Welcome back " + model.shopper?.name}</h1>
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
          />
          <br />

          <LoginAdmin
            instance={instance}
            andRefreshDisplay={andRefreshDisplay}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>
      ) : null}

      {/* SHOPPER VIEW */}
      {model.shopper?.loginToken && !adminToken && (
        <>
          {/* Navigation Buttons */}
          <div>
            <button className={styles.navButtonStyle} onClick={() => setShopperView("dashboard")}>
              Dashboard
            </button>
            <button className={styles.navButtonStyle} onClick={() => setShopperView("receipts")}>
              Receipts
            </button>
            <button className={styles.navButtonStyle} onClick={() => setShopperView("shoppingList")}>
              Shopping List
            </button>
            <button className={styles.navButtonStyle} onClick={() => setShopperView("history")}>
              History
            </button>
          </div>

          {/* Page Content */}
          <div className={styles.main}>
            {shopperView === "dashboard" && (
              <div>
                <h1>{"Welcome back " + model.shopper?.name}</h1><br />

                <AddChain
                  instance={instance}
                  andRefreshDisplay={andRefreshDisplay}
                  loginToken={model.getLoginToken()}
                /><br />

                <AddStore
                  instance={instance}
                  andRefreshDisplay={andRefreshDisplay}
                  loginToken={model.getLoginToken()}
                /><br />

                <ListStoreChains
                  instance={instance}
                  andRefreshDisplay={andRefreshDisplay}
                  loginToken={model.getLoginToken()}
                /><br />
              </div>
            )}

            {shopperView === "receipts" && (
              <ShopperReceiptView
                model={model}
                instance={instance}
                sync={sync}
              />
            )}

            {shopperView === "shoppingList" && (
              <div>
                <CreateShoppingList
                  model={model}
                  shoppingList={shoppingList}
                  setShoppingList={setShoppingList}
                  instance={instance}
                  andRefreshDisplay={andRefreshDisplay}
                /><br />
                <AddItemShoppingList
                  model={model}
                  shoppingList={shoppingList}
                  setShoppingList={setShoppingList}
                  instance={instance}
                  andRefreshDisplay={andRefreshDisplay}
                /><br />
                <RemoveItemShoppingList
                  model={model}
                  shoppingList={shoppingList}
                  setShoppingList={setShoppingList}
                  instance={instance}
                  andRefreshDisplay={andRefreshDisplay}
                /><br />
                <ReportOptionsShoppingList
                  model={model}
                  shoppingList={shoppingList}
                  setShoppingList={setShoppingList}
                  instance={instance}
                  andRefreshDisplay={andRefreshDisplay}
                />
              </div>
            )}

            {shopperView === "history" && (
              <div>
                <ReviewHistory model={model} instance={instance} andRefreshDisplay={andRefreshDisplay}></ReviewHistory><br></br>
                <ReviewActivity model={model} instance={instance} andRefreshDisplay={andRefreshDisplay}></ReviewActivity><br></br>
                <SearchRecentPurchases model={model} instance={instance} andRefreshDisplay={andRefreshDisplay}></SearchRecentPurchases>
              </div>
            )}
          </div>
        </>
      )}

      {/* ADMIN DASHBOARD VIEW */}
      {adminToken && (
        <div>
          <AdminDashboard
            instance={instance}
            adminToken={adminToken}
            refreshKey={redraw}
          /><br />

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
  </div>
)}
    
