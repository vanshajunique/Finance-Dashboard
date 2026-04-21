import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

const Login = ({ onAuthSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const { data } = await authApi.login(form);
      onAuthSuccess(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Finance App</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Login</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to view your balance, budgets, and insights.</p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <button className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-700">
          Login
        </button>

        <p className="mt-5 text-sm text-slate-500">
          Need an account?{" "}
          <Link to="/register" className="font-medium text-sky-700">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

