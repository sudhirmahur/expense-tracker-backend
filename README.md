# expense-tracker-backend
# 💰 Expense Tracker — Production Backend

A scalable, production-ready REST API built with **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Run
npm start        # Production
npm run dev      # Development (with nodemon)
```

---

## 📁 Project Structure

```
expense-tracker-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, login, me
│   ├── transactionController.js # CRUD + filters + pagination
│   ├── statsController.js     # Aggregation pipelines
│   └── referralController.js  # Referral system
├── middleware/
│   ├── authMiddleware.js      # JWT protect middleware
│   ├── errorMiddleware.js     # Global error + 404 handler
│   └── validateMiddleware.js  # express-validator chains
├── models/
│   ├── User.js                # User schema with referral
│   └── Transaction.js         # Transaction schema
├── routes/
│   ├── authRoutes.js
│   ├── transactionRoutes.js
│   ├── statsRoutes.js
│   └── referralRoutes.js
├── utils/
│   ├── generateToken.js       # JWT signing
│   ├── referralCode.js        # nanoid referral code
│   └── apiResponse.js         # Standardized responses
├── .env.example
├── .gitignore
├── package.json
└── server.js                  # App entry point
```

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Private | Get current user |

### Transactions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/transactions` | Private | Create transaction |
| GET | `/api/transactions` | Private | Get all (with filters) |
| PUT | `/api/transactions/:id` | Private | Update transaction |
| DELETE | `/api/transactions/:id` | Private | Delete transaction |

### Transaction Filters (Query Params)
```
GET /api/transactions
  ?type=income|expense
  &category=food|travel|...
  &startDate=2024-01-01
  &endDate=2024-12-31
  &search=keyword
  &sort=latest|oldest|highest|lowest
  &page=1
  &limit=10
```

### Stats & Analytics
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/stats/summary` | Private | Dashboard summary cards |
| GET | `/api/stats/category` | Private | Category pie chart data |
| GET | `/api/stats/monthly` | Private | Monthly bar/line chart data |

```
GET /api/stats/category?type=expense
GET /api/stats/monthly?months=6
```

### Referral System
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/referral/code` | Private | Get my referral code + invite link |
| GET | `/api/referral/users` | Private | Get users I referred |

---

## 📦 Transaction Categories
`food` · `travel` · `shopping` · `entertainment` · `healthcare` · `education` · `utilities` · `rent` · `salary` · `freelance` · `investment` · `gift` · `other`

---

## 🧪 Sample Request Bodies

### Register
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "secret123",
  "referralCode": "ABCD1234"   // optional
}
```

### Create Transaction
```json
{
  "type": "expense",
  "amount": 450.50,
  "category": "food",
  "note": "Lunch at office",
  "date": "2024-11-15"
}
```

---

## 🔒 Security Features
- Passwords hashed with **bcryptjs** (12 salt rounds)
- JWT tokens (7-day expiry by default)
- Input validation on all routes
- MongoDB ObjectId sanitization
- Payload size limit (10kb)
- Ownership check on all transaction operations

---

## ⚡ Performance
- MongoDB **compound indexes** on `userId + date`, `userId + type`, `userId + category`
- **Aggregation pipelines** for stats (single DB pass)
- Parallel queries with `Promise.all` where applicable
- Pagination capped at 100 items per page