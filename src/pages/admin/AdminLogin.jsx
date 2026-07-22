import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLogIn,
  FiMail,
  FiShield,
} from "react-icons/fi";

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

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    if (!form.email.trim()) {
      return toast.error("Email is required");
    }

    if (!form.password.trim()) {
      return toast.error("Password is required");
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/admin-login", form);

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
      <div className="admin-login-decoration admin-decoration-one" />
      <div className="admin-login-decoration admin-decoration-two" />
      <div className="admin-login-decoration admin-decoration-three" />

      <div className="admin-login-shell">
        <section className="admin-login-brand-panel">
          <div className="admin-login-brand-content">
            <div className="admin-login-logo">
              <span>JP</span>
            </div>

            <div className="admin-login-eyebrow">
              <FiShield />
              Secure administration
            </div>

            <h1>
              Manage Japan Pattasu
              <span>with complete control.</span>
            </h1>

            <p className="admin-login-description">
              Access products, inventory, orders,
              customers and employee management from
              one secure administration portal.
            </p>

            <div className="admin-login-features">
              <div className="admin-login-feature">
                <FiCheckCircle />

                <div>
                  <strong>Role-based access</strong>
                  <span>
                    Staff are redirected based on
                    department.
                  </span>
                </div>
              </div>

              <div className="admin-login-feature">
                <FiCheckCircle />

                <div>
                  <strong>Secure authentication</strong>
                  <span>
                    Protected access for authorized
                    employees.
                  </span>
                </div>
              </div>

              <div className="admin-login-feature">
                <FiCheckCircle />

                <div>
                  <strong>Centralized management</strong>
                  <span>
                    Control daily business operations
                    easily.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-login-brand-footer">
            <span className="admin-login-status-dot" />
            Administration portal is operational
          </div>
        </section>

        <section className="admin-login-form-panel">
          <form
            className="admin-login-card"
            onSubmit={handleSubmit}
          >
            <div className="admin-login-mobile-logo">
              <span>JP</span>
            </div>

            <div className="admin-login-form-header">
              <span className="admin-login-form-label">
                Staff portal
              </span>

              <h2>Welcome back</h2>

              <p>
                Enter your registered staff credentials
                to continue.
              </p>
            </div>

            <div className="admin-login-form-group">
              <label htmlFor="admin-email">
                Email address
              </label>

              <div className="admin-login-input-wrap">
                <FiMail className="admin-login-input-icon" />

                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="admin-login-form-group">
              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-login-input-wrap">
                <FiLock className="admin-login-input-icon" />

                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </button>
              </div>
            </div>

            <div className="admin-login-security-note">
              <FiShield />
              <span>
                Only authorized Japan Pattasu staff can
                access this portal.
              </span>
            </div>

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-login-spinner" />
                  Logging in...
                </>
              ) : (
                <>
                  <FiLogIn />
                  Login to dashboard
                </>
              )}
            </button>

            <p className="admin-login-support-text">
              Having trouble signing in? Contact your
              system administrator.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;