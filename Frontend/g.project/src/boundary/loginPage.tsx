import React from 'react';



function LoginPage({ /* maybe a sync/update function to update React variables? */ }: { /* sync: any */ }) {
  //const [..., ...]        = React.useState(...);
  //...

  function addItemController() {
      const nameElement                = document.getElementById(`new-item-name`)                  as HTMLInputElement;
      const descriptionElement         = document.getElementById(`new-item-description`)           as HTMLInputElement;
      const InitialBiddingPriceElement = document.getElementById(`new-item-initial_bidding_price`) as HTMLInputElement;

      const itemName                   = nameElement.value;
      const itemDescription            = descriptionElement.value;
      const itemInitialBiddingPrice    = parseFloat(InitialBiddingPriceElement.value);

      // Only proceed if all item fields are given
      if((itemName        === ""  ) ||
         (itemDescription === ""  ) ||
         (!itemInitialBiddingPrice)
         ) {

          return;
      }

      const newItem                    = new Item(itemName, itemDescription, itemInitialBiddingPrice);

      bidMaster.addItem(newItem);
      addItems([...bidMaster.getAuction().getToAuction()]);

      nameElement.value                = '';
      descriptionElement.value         = '';
      InitialBiddingPriceElement.value = '';

      sync();
  }

  function auctionItemController(item: Item) {
      // only proceed if item is given
      if (!item) return;

      bidMaster.auctionItem(item);
      sync();
  }

  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        { /* first column */ }
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          { /* item name input */ }
          <div style={{ display: "flex", gap: "106.5px", alignItems: "center" }}>
            <label htmlFor="new-item-name">Name:</label>
            <input data-testid={'test-item-name-box'} id="new-item-name" style={{ width: "150px" }} />
          </div>

          { /* item description input */ }
          <div style={{ display: "flex", gap: "66.5px", alignItems: "center" }}>
            <label htmlFor="new-item-description">Description:</label>
            <input data-testid={'test-item-description-box'} id="new-item-description" style={{ width: "250px" }} />
          </div>

          { /* item initial bidding price input */ }
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label htmlFor="new-item-initial_bidding_price">Initial Bidding Price:</label>
            <input data-testid={'test-item-initial-bidding-price-box'} id="new-item-initial_bidding_price" style={{ width: "120px" }} />
          </div>
        </div>


        { /* second column */ }
        <div>
          { /* button to add items */ }
          <button data-testid={'test-add-item-button'} onClick={() => addItemController()}>Add Item</button>

          {/* dropdown list to select first item to auction */}
          <div style={{ marginTop: "10px" }}>
            <select
              data-testid={'test-auction-item-dropdown'}
              onChange={(e) => {
                const item = ItemsToBeAuctioned.find(i => i.getName() === e.target.value);
                auctionItemController(item!);
              }}
            >
              <option value="">Auction Item</option>
              {ItemsToBeAuctioned.map((item, index) => (
                <option key={index} value={item.getName()}>
                  {item.getName()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>


      {/* monocolumn list of items to be auctioned */}
      <ul style={{ padding: 0 }}>
        {ItemsToBeAuctioned.map((item: Item, index: number) => (
          <li key={index}>
            {item.getName()}{" "}
            <span style={{ fontSize: "15px" }}>
              (${item.getInitialBiddingPrice()}) [{item.getDescription()}]
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

} export { LoginPage }