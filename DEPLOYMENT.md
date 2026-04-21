# Production Deployment Guide

This guide deploys the MERN Personal Finance Dashboard with:

- Backend on Render
- Frontend on Vercel
- Database on MongoDB Atlas

## Required Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/finance-dashboard?retryWrites=true&w=majority
JWT_SECRET=<generate-a-long-random-secret>
CLIENT_URLS=https://your-frontend-domain.vercel.app
MONGO_MAX_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=1
MONGO_SERVER_SELECTION_TIMEOUT_MS=5000
MONGO_SOCKET_TIMEOUT_MS=45000
```

If you use a custom frontend domain, add it to `CLIENT_URLS` as a comma-separated value:

```env
CLIENT_URLS=https://your-frontend-domain.vercel.app,https://finance.yourdomain.com
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=https://your-render-service.onrender.com/api
```

## Final Production Folder Structure

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

## Step 1: MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. In Atlas, open `Network Access` and allow Render access.
   For quick setup you can use `0.0.0.0/0`, then tighten it later.
4. Copy the connection string and replace `<username>`, `<password>`, and database name with `finance-dashboard`.

## Step 2: Deploy the Backend to Render

1. Push the repository to GitHub.
2. In Render, create a new `Web Service`.
3. Connect the GitHub repository.
4. Set:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the backend environment variables from the section above.
6. Deploy the service.
7. Confirm the backend is healthy by opening:
   - `https://your-render-service.onrender.com/api/health`

## Step 3: Deploy the Frontend to Vercel

1. In Vercel, import the same GitHub repository.
2. Set the project root to `frontend`.
3. Add:
   - `REACT_APP_API_URL=https://your-render-service.onrender.com/api`
4. Deploy the project.
5. Because `frontend/vercel.json` rewrites all routes to `index.html`, React Router routes will work on refresh in production.

## Step 4: Wire Backend CORS to the Frontend Domain

1. Copy the deployed Vercel frontend URL.
2. In Render, update:

```env
CLIENT_URLS=https://your-frontend-domain.vercel.app
```

3. Redeploy the backend after changing environment variables.

## Production Commands

### Local verification

```bash
cd backend
npm install
npm start
```

```bash
cd frontend
npm install
npm run build
```

### Render

```bash
cd backend
npm install
npm start
```

### Vercel

```bash
cd frontend
npm install
npm run build
```

## Deployment Checklist

1. Atlas connection string points to the production cluster.
2. Render `CLIENT_URLS` matches the Vercel domain exactly.
3. Vercel `REACT_APP_API_URL` points to the Render backend `/api`.
4. Render `JWT_SECRET` is a strong secret and is not reused from development.
5. `/api/health` returns a success response after deployment.
6. Register, login, dashboard fetches, and protected routes all work in the deployed app.

## Authentication Notes

- Authentication uses JWT bearer tokens stored in browser local storage.
- The frontend automatically attaches the token on every API request.
- The backend validates the token using `JWT_SECRET`.
- If the token becomes invalid, the frontend clears it and sends the user back through login.
