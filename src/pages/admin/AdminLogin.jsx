import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/admin.css";

const departmentRedirect = {
  super_admin: "/admin/dashboard",
  admin: "/admin/dashboard",
  inventory: "/admin/products",
  orders: "/admin/orders",
  customer_support: "/admin/customers",
};

const AdminLogin = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim())
      return toast.error("Email is required");

    if (!form.password.trim())
      return toast.error("Password is required");

    try {
      setLoading(true);

      const res = await api.post(
        "/auth/admin-login",
        form
      );

      localStorage.setItem(
        "adminToken",
        res.data.access_token
      );

      localStorage.setItem(
        "adminUser",
        JSON.stringify(res.data.user)
      );

      toast.success(res.data.message);

      navigate(
        departmentRedirect[
          res.data.user.department
        ] || "/admin/dashboard",
        {
          replace: true,
        }
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form
        className="admin-login-card"
        onSubmit={handleSubmit}
      >
        <h1>🎆 Japan Pattasu</h1>
        <h2>Staff Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
        />

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <button
          type="button"
          className="admin-show-btn"
          onClick={() =>
            setShowPassword(
              !showPassword
            )
          }
        >
          {showPassword
            ? "Hide Password"
            : "Show Password"}
        </button>

        <button
          type="submit"
          className="admin-login-btn"
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;