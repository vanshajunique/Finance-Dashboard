# Personal Finance Dashboard

A MERN personal finance dashboard with JWT authentication, analytics, budgets, goals, CSV import, and a responsive React UI.

## Project Structure

```text
finance-dashboard/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- .env.example
|   |-- package.json
|   |-- render.yaml
|   `-- server.js
|-- frontend/
|   |-- public/
|   |-- src/
|   |-- .env.example
|   |-- package.json
|   `-- vercel.json
|-- .gitignore
|-- DEPLOYMENT.md
`-- README.md
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Environment Variables

### Backend

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/finance-dashboard
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URLS=http://localhost:3000
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=1
MONGO_SERVER_SELECTION_TIMEOUT_MS=5000
MONGO_SOCKET_TIMEOUT_MS=45000
```

### Frontend

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Build Commands

```bash
cd backend
npm start
```

```bash
cd frontend
npm run build
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/accounts`
- `POST /api/accounts`
- `DELETE /api/accounts/:id`
- `GET /api/goals`
- `POST /api/goals`
- `POST /api/goals/:id/contribute`
- `DELETE /api/goals/:id`
- `GET /api/transactions`
- `POST /api/transactions`
- `DELETE /api/transactions/:id`
- `POST /api/transactions/import/csv`
- `GET /api/dashboard`
- `POST /api/dashboard/budget`

## Production Deployment

See [DEPLOYMENT.md](/C:/Users/vanshaj%20ahlawat/OneDrive/Documents/New%20project/finance-dashboard/DEPLOYMENT.md) for the full deployment guide for:

- Backend on Render
- Frontend on Vercel
- Database on MongoDB Atlas

## Production Notes

- Backend CORS supports one or more frontend domains through `CLIENT_URLS`.
- Frontend API calls are routed through `REACT_APP_API_URL`.
- `frontend/vercel.json` keeps React Router routes working on refresh in production.
- Errors return safe production responses while still exposing stack traces in development only.
