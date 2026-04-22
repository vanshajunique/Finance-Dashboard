import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Accounts from "./pages/Accounts";
import Analytics from "./pages/Analytics";
import Budgets from "./pages/Budgets";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Transactions from "./pages/Transactions";
import { authApi } from "./services/api";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("finance_dashboard_token"),
    user: null,
    loading: true
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.token) {
        setAuth((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const { data } = await authApi.getMe();
        setAuth((prev) => ({
          ...prev,
          user: data,
          loading: false
        }));
      } catch (_error) {
        localStorage.removeItem("finance_dashboard_token");
        setAuth({
          token: null,
          user: null,
          loading: false
        });
      }
    };

    fetchUser();
  }, [auth.token]);

  const handleAuthSuccess = (data) => {
    localStorage.setItem("finance_dashboard_token", data.token);
    setAuth({
      token: data.token,
      user: data.user,
      loading: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("finance_dashboard_token");
    setAuth({
      token: null,
      user: null,
      loading: false
    });
  };

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          auth.token ? <Navigate to="/dashboard" replace /> : <Login onAuthSuccess={handleAuthSuccess} />
        }
      />
      <Route
        path="/register"
        element={
          auth.token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register onAuthSuccess={handleAuthSuccess} />
          )
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth.token)}>
            <Dashboard user={auth.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth.token)}>
            <Accounts user={auth.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth.token)}>
            <Transactions user={auth.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth.token)}>
            <Budgets user={auth.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth.token)}>
            <Analytics user={auth.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth.token)}>
            <Goals user={auth.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute isAuthenticated={Boolean(auth.token)}>
            <Settings user={auth.user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={auth.token ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
