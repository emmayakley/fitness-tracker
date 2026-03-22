# Health & Wellness Tracker

A full stack fitness tracking application built with React and Node.js/Express, using the [wger](https://wger.de) open source fitness API.

🔗 **Live Site:** https://fitness-tracker-tpxy.vercel.app

---

## Features
- Create and manage workout routines
- Add days and exercises to routines
- Log sets, reps, and weights during an active workout
- Track workout consistency and exercise progress over time
- Inspirational quote and workout counter on the homepage

---

## Tech Stack
- **Frontend:** React, Vite, React Router, Bootstrap, Recharts
- **Backend:** Node.js, Express, axios
- **API:** wger REST API
- **Deployment:** Vercel

---

## Running Locally

### Prerequisites
- Node.js v18 or higher
- A free wger account at [wger.de](https://wger.de)

### 1. Clone the repo
```bash
git clone https://github.com/emmayakley/fitness-tracker.git
cd fitness-tracker
```

### 2. Get your wger API token
1. Create a free account at [wger.de](https://wger.de)
2. Log in and go to your profile settings
3. Find the **API Token** section and copy your token

### 3. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:
```
WGER_TOKEN=your_token_here
```

Start the backend:
```bash
npm run dev
```

### 4. Set up the frontend
```bash
cd client
npm install
```

Create a `.env` file in the `client/` folder:
```
VITE_API_URL=http://localhost:3001
```

Start the frontend:
```bash
npm run dev
```

### 5. Open the app
Visit `http://localhost:5173` in your browser.

---

## Running Tests
```bash
cd server
npm test
```

---

## Deployment
The app is deployed on Vercel as two separate projects:
- **Frontend:** https://fitness-tracker-tpxy.vercel.app
- **Backend:** https://fitness-tracker-delta-blush.vercel.app

To deploy your own version, follow the [Vercel deployment docs](https://vercel.com/docs/getting-started-with-vercel) and set the following environment variables:
- **Server:** `WGER_TOKEN` = your wger API token
- **Client:** `VITE_API_URL` = your deployed server URL