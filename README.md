# ⚡ CP Tracker

A full-stack competitive programming tracker that fetches real-time stats from Codeforces and LeetCode APIs.

## 🚀 Features
- JWT Authentication (Register/Login)
- Real-time Codeforces stats (rating, rank, max rating)
- Real-time LeetCode stats (easy/medium/hard solved)
- CF Rating History Chart (Line Chart)
- LC Problems Breakdown (Doughnut Chart)
- LC Topic-wise Breakdown (Bar Chart)
- Weak Area Analyzer with smart suggestions
- Friend Comparison System
- Platform filter (CF only / LC only / Both)
- Responsive UI with lavender/blue theme

## 🛠 Tech Stack
- **Frontend:** React.js, Chart.js, React Router, Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcryptjs
- **APIs:** Codeforces API, LeetCode GraphQL API

## ⚙️ Setup

### Backend
cd cpbackend
npm install
node app.js

### Frontend
cd cpfrontend
npm install
npm run dev

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/user/handles | Save CF/LC handles |
| GET | /api/user/cf-stats | Get CF stats |
| GET | /api/user/lc-stats | Get LC stats |
| GET | /api/user/cf-history | Get CF rating history |
| GET | /api/user/weak-area | Get weak area suggestion |
| GET | /api/user/lc-topics | Get LC topic breakdown |
| GET | /api/user/compare | Compare with friend |
| POST | /api/user/friends/add | Add friend |
| GET | /api/user/friends | Get friends list |
| POST | /api/user/friends/remove | Remove friend |

## 🔮 Future Scope
- Google/Facebook OAuth
- Daily problem reminder
- Goal setting with progress bar
- Streak tracker