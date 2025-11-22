# PredictPlay – Frontend Betting Simulation App

PredictPlay is a **React + Vite + TailwindCSS** frontend project that simulates a modern sports-betting platform.  
It includes mock authentication, wallet management, bet slips, markets, live fixtures, and localStorage persistence — all in a single-page app.

---

## 🚀 Features

- User Authentication (mock)
- Sports Markets (Cricket, Football, Basketball)
- Bet Slip System (multi-selection)
- Wallet with Deposit/Withdrawal (demo mode)
- Transaction History
- Profile + KYC (mock verification)
- Responsible Gaming Section
- Persistent data using `localStorage`
- Responsive UI using **TailwindCSS**
- Smooth UI animations via **Framer Motion**

---

## 🛠 Tech Stack

- **React 19**
- **Vite**
- **TailwindCSS**
- **Framer Motion**
- **Lucide Icons**
- **localStorage (mock backend)**

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
https://github.com/transmogrify-cell/predictplay.git
```
cd predictplay

2. Install Dependencies
```bash
npm install
```

3. Start Development Server
```bash
npm run dev
```

4. Build for Production
```bash
npm run build
```

5. Preview Production Build
```bash
npm run preview
```
predictplay/
│── public/
│── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── assets/
│── tailwind.config.js
│── package.json
│── README.md
How It Works

All user data is stored in localStorage

Wallet, transactions, slips, and KYC persist across refresh


SQL Backend 


Key Database Tables

users – user profiles (with roles & hashed passwords)

wallet – linked to users, stores balance

sports – sports categories

teams – sports teams

games – fixtures with sport, teams, time, status

selections – betting options + odds

bets – placed bets

bet_items – selections inside a bet

transactions – deposits, withdrawals, payout logs

audit_log – safety & tracking logs

Highlights

Wallet auto-created via trigger

Bet placement automatically deducts balance

Winning bets trigger payouts

Withdrawal validation to avoid negative balance

Full audit history for transparency

📜 License

This project is intended for educational/demo use only.

