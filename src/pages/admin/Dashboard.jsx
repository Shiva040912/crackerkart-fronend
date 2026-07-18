import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBox,
  FiGrid,
  FiLayers,
  FiLogOut,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/admincommon.css";
import "../../styles/admindashboard.css";
import AdminSidebar from "../../components/AdminSidebar";

const Dashboard = () => {
  const navigate = useNavigate();

  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const [summary, setSummary] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalStock: 0,
    totalRevenue: 0,
    lowStockProducts: [],
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/dashboard/summary"
      );

      setSummary(response.data);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        "Unable to load dashboard";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    toast.success("Admin logged out");
    navigate("/admin/login");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const cards = [
    {
      title: "Total Customers",
      value: summary.totalCustomers,
      text: "Registered customers",
      icon: <FiUsers />,
    },
    {
      title: "Total Products",
      value: summary.totalProducts,
      text: "Products available",
      icon: <FiPackage />,
    },
    {
      title: "Total Categories",
      value: summary.totalCategories,
      text: "Product categories",
      icon: <FiGrid />,
    },
    {
      title: "Total Stock",
      value: summary.totalStock,
      text: "Combined stock units",
      icon: <FiLayers />,
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      text: "Orders received",
      icon: <FiShoppingBag />,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      text: "Paid non-cancelled orders",
      icon: <FiTrendingUp />,
    },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar/>
        

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back, {adminUser?.name || "Admin"}.
              Here is your store overview.
            </p>
          </div>

          <div className="admin-user-chip">
            <span className="admin-user-avatar">
              {(adminUser?.name || "A")
                .charAt(0)
                .toUpperCase()}
            </span>

            <div>
              <strong>{adminUser?.name || "Admin"}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="admin-loading">
            Loading dashboard...
          </div>
        ) : error ? (
          <div className="admin-error">{error}</div>
        ) : (
          <>
            <section className="dashboard-summary-grid">
              {cards.map((card) => (
                <article
                  className="summary-card"
                  key={card.title}
                >
                  <div className="summary-card-head">
                    <span className="summary-card-icon">
                      {card.icon}
                    </span>
                  </div>

                  <h3>{card.title}</h3>
                  <strong>{card.value}</strong>
                  <p>{card.text}</p>
                </article>
              ))}
            </section>

            <section className="dashboard-section-grid">
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h2>Recent Orders</h2>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/orders")
                    }
                  >
                    View All
                  </button>
                </div>

                {summary.recentOrders?.length === 0 ? (
                  <div className="dashboard-empty">
                    No orders available
                  </div>
                ) : (
                  <table className="recent-order-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Invoice</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {summary.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="order-customer">
                            <strong>
                              {order.user?.name ||
                                order.deliveryAddress
                                  ?.fullName ||
                                "Customer"}
                            </strong>

                            <span>
                              {order.user?.email ||
                                order.user?.phone ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            {order.invoiceNumber || "-"}
                          </td>

                          <td>
                            {formatCurrency(
                              order.totalAmount ||
                                order.grandTotal ||
                                0
                            )}
                          </td>

                          <td>
                            <span
                              className={`dashboard-status ${
                                order.orderStatus ===
                                "cancelled"
                                  ? "cancelled"
                                  : ""
                              }`}
                            >
                              {order.orderStatus ||
                                "confirmed"}
                            </span>
                          </td>

                          <td>
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <h2>Low Stock</h2>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/stock")
                    }
                  >
                    Manage
                  </button>
                </div>

                {summary.lowStockProducts?.length === 0 ? (
                  <div className="dashboard-empty">
                    All products have enough stock
                  </div>
                ) : (
                  <div className="low-stock-list">
                    {summary.lowStockProducts.map(
                      (product) => (
                        <div
                          className="low-stock-item"
                          key={product._id}
                        >
                          <div>
                            <h4>{product.name}</h4>
                            <p>
                              {product.brand ||
                                "No brand"}
                            </p>
                          </div>

                          <span className="low-stock-count">
                            {product.stock}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="dashboard-quick-actions">
              <button
                onClick={() =>
                  navigate("/admin/categories")
                }
              >
                + Add Category
              </button>

              <button
                onClick={() =>
                  navigate("/admin/products")
                }
              >
                + Add Product
              </button>

              <button
                onClick={() =>
                  navigate("/admin/customers")
                }
              >
                View Customers
              </button>

              <button
                onClick={() =>
                  navigate("/admin/stock")
                }
              >
                Manage Stock
              </button>

              <button
                onClick={() =>
                  navigate("/admin/orders")
                }
              >
                Manage Orders
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;