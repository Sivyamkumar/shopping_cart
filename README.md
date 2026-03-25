# 🛒 Modern Node.js Shopping Cart

Welcome! This is a robust, full-stack shopping cart application. It uses **Node.js** and **Express** for the server, **MongoDB Atlas** for the database, and integrates **Stripe** for handling secure payments.

![Checkout Process Preview](https://user-images.githubusercontent.com/28437795/124288418-d3633a80-db59-11eb-8ecd-f01dba239fb7.png)

---

## 🌟 Key Features
- **Browse Games**: A pre-loaded catalog of popular games with descriptions and prices.
- **Dynamic Cart**: Real-time cart updates (add, remove, change quantities).
- **Secure Payments**: Fully integrated with Stripe's test payment system.
- **User Accounts**: Sign-up and login functionality with persistent order histories.
- **Order Tracking**: Users can view all their past successful purchases.

---

## 📋 Quick Setup Guide

### 1. Requirements
*   **Node.js**: Installed on your machine.
*   **MongoDB**: An Atlas Cluster or a Local MongoDB URI.
*   **Stripe**: A free developer account for your `Secret` and `Publishable` keys.

### 2. Configure Environment (`.env`)
Create a file named `.env` in the root folder and fill in the following:

```env
PORT=3000
MONGO_DB_URL=mongodb+srv://<user>:<password>@cluster.xyz.mongodb.net/shop
STRIPE_SECRET_KEY=sk_test_your_secret_key_goes_here
```

### 3. Set Your Stripe Public Key
Open `public/javascripts/checkout.js` and update your public key:
```javascript
const stripePublishableTestKey = 'pk_test_your_public_key_here';
```

### 4. Install & Prepare
Run these commands in your terminal:
```bash
# Install all required packages
npm install

# (Optional) Verify your MongoDB connection is correct
```

---

## 📦 How to Populate Data (Migration)
This project doesn't have an admin panel for adding games yet. To add the initial product list to your database, run:

```bash
npm run migration:write
```
*Note: This script uses Mongoose 8 and will automatically create the collections in your MongoDB Atlas.*

---

## 🚀 How to Start the Server
To launch the website, use the following command:

```bash
npm start
```
Once started, open your browser and go to:
### **[http://localhost:3000](http://localhost:3000)**

---

## 🛠️ Tech Stack
*   **Backend**: Node.js & Express.js
*   **Database**: MongoDB (via Mongoose)
*   **Frontend**: Handlebars Templating (`.hbs`)
*   **Payments**: Stripe API
*   **Styling**: Bootstrap 4
*   **Security**: Passport.js for Authentication

---

## 🔧 Troubleshooting
- **Port already in use**: If port 3000 is busy, change the `PORT` in your `.env` file.
- **MongoDB Connection Error**: Check your IP Whitelist in the MongoDB Atlas dashboard.
- **Stripe Public Key Error**: Ensure `checkout.js` has your real `pk_test_...` key.
