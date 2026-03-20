# decentralized_market_place12
# 📦 Decentralized Marketplace Smart Contract

## 📌 Overview

This repository contains the smart contract **`decentralized_market_place12`**, deployed at the following address:

```
CDQWFRUNMAALWG2L2TH3W6D5XPJ4DFBGC6RH4DJX6EVQ23HXJKCAJS26
```

The contract implements a decentralized marketplace, enabling users to list, buy, and manage digital or physical assets without relying on a centralized intermediary.

---

## 🔗 Contract Details

* **Contract Name:** `decentralized_market_place12`
* **Contract Address:** `CDQWFRUNMAALWG2L2TH3W6D5XPJ4DFBGC6RH4DJX6EVQ23HXJKCAJS26`
* **Network:** Stellar / Soroban (confirm Testnet or Mainnet)
* **Language:** Rust
* **Framework:** Soroban SDK

---

## 🛒 Features

* 📄 Asset listing by sellers
* 💰 Direct peer-to-peer purchases
* 🔐 Secure escrow-like transaction handling
* 📊 Transparent on-chain records
* 👤 Ownership tracking
* ❌ Listing cancellation and updates

---

## 🧩 Core Functionalities

### 🔹 Listing Management

| Function           | Description                       |
| ------------------ | --------------------------------- |
| `create_listing()` | Create a new marketplace listing  |
| `update_listing()` | Modify listing details            |
| `cancel_listing()` | Remove a listing from marketplace |

### 🔹 Transactions

| Function           | Description             |
| ------------------ | ----------------------- |
| `buy_item()`       | Purchase a listed item  |
| `transfer_funds()` | Handle payment transfer |

### 🔹 Query Functions

| Function             | Description                    |
| -------------------- | ------------------------------ |
| `get_listing()`      | Retrieve listing details       |
| `get_all_listings()` | Fetch all marketplace listings |
| `get_owner()`        | Get contract owner             |

---

## 📡 Events

| Event              | Description                       |
| ------------------ | --------------------------------- |
| `ListingCreated`   | Emitted when a new item is listed |
| `ListingUpdated`   | Emitted when listing is modified  |
| `ListingCancelled` | Emitted when listing is removed   |
| `ItemPurchased`    | Emitted when a purchase occurs    |

---

## 🚀 How to Interact

### Using Soroban CLI

```bash
soroban contract invoke \
  --id CDQWFRUNMAALWG2L2TH3W6D5XPJ4DFBGC6RH4DJX6EVQ23HXJKCAJS26 \
  --fn create_listing \
  --arg '{"price":100, "item":"example"}'
```

### JavaScript Example

```javascript
const result = await contract.call("buy_item", {
  listing_id: 1
});
```

---

## 🏗 Architecture

The contract follows a simple marketplace model:

1. Sellers create listings
2. Listings are stored on-chain
3. Buyers interact with listings
4. Payments are processed via contract logic
5. Ownership/state updates after purchase

---

## 🔐 Security Considerations

* Validate seller ownership before listing updates
* Prevent double-spending or duplicate purchases
* Ensure secure fund transfers
* Use proper authorization checks
* Audit contract before production deployment

---

## 🧪 Testing

* Unit tests using Rust
* Local simulation with Soroban CLI
* Edge case testing (invalid listings, insufficient funds)

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

## 📄 License

MIT License (recommended)

---

## 📞 Contact

* Developer: (Sourjo Ghosh)
* Email: (sourjoghosh90@gmail.com)

---

Deploy contact link :
https://lab.stellar.org/smart-contracts/contract-explorer?$=network$id=testnet&label=Testnet&horizonUrl=https:////horizon-testnet.stellar.org&rpcUrl=https:////soroban-testnet.stellar.org&passphrase=Test%20SDF%20Network%20/;%20September%202015;&smartContracts$explorer$contractId=CDQWFRUNMAALWG2L2TH3W6D5XPJ4DFBGC6RH4DJX6EVQ23HXJKCAJS26;;
<img width="1872" height="941" alt="image" src="https://github.com/user-attachments/assets/18168b14-b5c4-46f9-a24e-3061cb4acd73" />

---

<img width="1047" height="536" alt="image" src="https://github.com/user-attachments/assets/97f3c21f-2444-4273-9bdd-8adab77ab6ce" />


---

Contract Address:CDQWFRUNMAALWG2L2TH3W6D5XPJ4DFBGC6RH4DJX6EVQ23HXJKCAJS26


## ⚠️ Disclaimer

This project is experimental and provided "as is". Use at your own risk. Always conduct audits before using in production.
