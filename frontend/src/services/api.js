import axios from "axios";

const rawApiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const apiBaseUrl = rawApiBaseUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("finance_dashboard_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  getMe: () => api.get("/auth/me")
};

export const transactionApi = {
  getAll: () => api.get("/transactions"),
  create: (payload) => api.post("/transactions", payload),
  remove: (id) => api.delete(`/transactions/${id}`),
  importCsv: (formData) =>
    api.post("/transactions/import/csv", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};

export const accountApi = {
  create: (payload) => api.post("/accounts", payload),
  getAll: () => api.get("/accounts"),
  remove: (id) => api.delete(`/accounts/${id}`)
};

export const goalApi = {
  create: (payload) => api.post("/goals", payload),
  getAll: () => api.get("/goals"),
  contribute: (id, payload) => api.post(`/goals/${id}/contribute`, payload),
  remove: (id) => api.delete(`/goals/${id}`)
};

export const dashboardApi = {
  getOverview: () => api.get("/dashboard"),
  setBudget: (payload) => api.post("/dashboard/budget", payload)
};

export default api;
