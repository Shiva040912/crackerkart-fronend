import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiGrid,
  FiLayers,
  FiPackage,
  FiShoppingBag,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../../api/axios";
import "../../styles/admincommon.css";
import "../../styles/admindashboard.css";
import AdminSidebar from "../../components/AdminSidebar";

const Dashboard = () => {
  const navigate = useNavigate();

  let adminUser = {};

  try {
    adminUser = JSON.parse(
      localStorage.getItem("adminUser") || "{}"
    );
  } catch {
    adminUser = {};
  }

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatRole = (role) => {
    return String(role || "Administrator")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getStatusClass = (status) => {
    const normalizedStatus = String(
      status || "confirmed"
    ).toLowerCase();

    return normalizedStatus.replaceAll(" ", "-");
  };

  const cards = [
    {
      title: "Total Customers",
      value: summary.totalCustomers,
      text: "Registered customers",
      icon: <FiUsers />,
      className: "customers",
    },
    {
      title: "Total Products",
      value: summary.totalProducts,
      text: "Products available",
      icon: <FiPackage />,
      className: "products",
    },
    {
      title: "Total Categories",
      value: summary.totalCategories,
      text: "Product categories",
      icon: <FiGrid />,
      className: "categories",
    },
    {
      title: "Total Stock",
      value: summary.totalStock,
      text: "Combined stock units",
      icon: <FiLayers />,
      className: "stock",
    },
    {
      title: "Total Orders",
      value: summary.totalOrders,
      text: "Orders received",
      icon: <FiShoppingBag />,
      className: "orders",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      text: "Revenue from paid orders",
      icon: <FiTrendingUp />,
      className: "revenue",
    },
  ];

  const quickActions = [
    {
      title: "Add Category",
      text: "Create a new product category",
      path: "/admin/categories",
      icon: <FiGrid />,
    },
    {
      title: "Add Product",
      text: "Create and publish a product",
      path: "/admin/products",
      icon: <FiPackage />,
    },
    {
      title: "View Customers",
      text: "Manage registered customers",
      path: "/admin/customers",
      icon: <FiUsers />,
    },
    {
      title: "Manage Stock",
      text: "Review and update inventory",
      path: "/admin/stock",
      icon: <FiLayers />,
    },
    {
      title: "Manage Orders",
      text: "Track and update customer orders",
      path: "/admin/orders",
      icon: <FiShoppingBag />,
    },
  ];

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-topbar dashboard-topbar">
          <div className="dashboard-heading">
            <span className="dashboard-eyebrow">
              Store Management
            </span>

            <h1>Dashboard Overview</h1>

            <p>
              Welcome back,{" "}
              <strong>
                {adminUser?.name || "Admin"}
              </strong>
              . Here is the latest overview of your store.
            </p>
          </div>

          <div className="admin-user-chip">
            <span className="admin-user-avatar">
              {(adminUser?.name || "A")
                .charAt(0)
                .toUpperCase()}
            </span>

            <div>
              <strong>
                {adminUser?.name || "Admin"}
              </strong>

              <small>
                {formatRole(
                  adminUser?.department ||
                    adminUser?.role
                )}
              </small>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="admin-loading dashboard-loading">
            <span className="dashboard-loader" />
            <p>Loading dashboard overview...</p>
          </div>
        ) : error ? (
          <div className="admin-error dashboard-error">
            <FiAlertTriangle />

            <div>
              <strong>Unable to load dashboard</strong>
              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <section className="dashboard-summary-grid">
              {cards.map((card) => (
                <article
                  className={`summary-card ${card.className}`}
                  key={card.title}
                >
                  <div className="summary-card-decoration" />

                  <div className="summary-card-head">
                    <span className="summary-card-icon">
                      {card.icon}
                    </span>

                    <span className="summary-card-label">
                      Overview
                    </span>
                  </div>

                  <div className="summary-card-content">
                    <h3>{card.title}</h3>
                    <strong>{card.value}</strong>
                    <p>{card.text}</p>
                  </div>
                </article>
              ))}
            </section>

            <section className="dashboard-section-grid">
              <div className="dashboard-panel recent-orders-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <span className="dashboard-panel-eyebrow">
                      Latest Activity
                    </span>

                    <h2>Recent Orders</h2>

                    <p>
                      Latest customer orders received by
                      the store
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/orders")
                    }
                  >
                    View All
                    <FiArrowRight />
                  </button>
                </div>

                {summary.recentOrders?.length === 0 ? (
                  <div className="dashboard-empty">
                    <span>
                      <FiShoppingBag />
                    </span>

                    <h3>No recent orders</h3>

                    <p>
                      New customer orders will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="recent-order-table-wrapper">
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
                        {summary.recentOrders.map(
                          (order) => {
                            const orderStatus =
                              order.orderStatus ||
                              "confirmed";

                            return (
                              <tr key={order._id}>
                                <td className="order-customer">
                                  <div className="order-customer-content">
                                    <span className="order-customer-avatar">
                                      {(
                                        order.user?.name ||
                                        order
                                          .deliveryAddress
                                          ?.fullName ||
                                        "C"
                                      )
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>

                                    <div>
                                      <strong>
                                        {order.user?.name ||
                                          order
                                            .deliveryAddress
                                            ?.fullName ||
                                          "Customer"}
                                      </strong>

                                      <span>
                                        {order.user?.email ||
                                          order.user
                                            ?.phone ||
                                          "-"}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                <td>
                                  <span className="order-invoice">
                                    {order.invoiceNumber ||
                                      "-"}
                                  </span>
                                </td>

                                <td>
                                  <strong className="order-amount">
                                    {formatCurrency(
                                      order.totalAmount ||
                                        order.grandTotal ||
                                        0
                                    )}
                                  </strong>
                                </td>

                                <td>
                                  <span
                                    className={`dashboard-status ${getStatusClass(
                                      orderStatus
                                    )}`}
                                  >
                                    {orderStatus}
                                  </span>
                                </td>

                                <td>
                                  <span className="order-date">
                                    {formatDate(
                                      order.createdAt
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="dashboard-panel low-stock-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <span className="dashboard-panel-eyebrow">
                      Inventory Alert
                    </span>

                    <h2>Low Stock</h2>

                    <p>
                      Products requiring stock attention
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/admin/stock")
                    }
                  >
                    Manage
                    <FiArrowRight />
                  </button>
                </div>

                {summary.lowStockProducts?.length === 0 ? (
                  <div className="dashboard-empty low-stock-empty">
                    <span>
                      <FiLayers />
                    </span>

                    <h3>Stock levels are healthy</h3>

                    <p>
                      All products currently have enough
                      stock.
                    </p>
                  </div>
                ) : (
                  <div className="low-stock-list">
                    {summary.lowStockProducts.map(
                      (product) => (
                        <div
                          className="low-stock-item"
                          key={product._id}
                        >
                          <div className="low-stock-product">
                            <span className="low-stock-warning">
                              <FiAlertTriangle />
                            </span>

                            <div>
                              <h4>{product.name}</h4>

                              <p>
                                {product.brand ||
                                  "No brand"}
                              </p>
                            </div>
                          </div>

                          <div className="low-stock-value">
                            <strong>{product.stock}</strong>
                            <span>left</span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="dashboard-quick-actions-section">
              <div className="dashboard-section-heading">
                <div>
                  <span className="dashboard-panel-eyebrow">
                    Shortcuts
                  </span>

                  <h2>Quick Actions</h2>

                  <p>
                    Access frequently used management
                    sections
                  </p>
                </div>
              </div>

              <div className="dashboard-quick-actions">
                {quickActions.map((action) => (
                  <button
                    type="button"
                    key={action.title}
                    onClick={() =>
                      navigate(action.path)
                    }
                  >
                    <span className="quick-action-icon">
                      {action.icon}
                    </span>

                    <span className="quick-action-content">
                      <strong>{action.title}</strong>
                      <small>{action.text}</small>
                    </span>

                    <span className="quick-action-arrow">
                      <FiArrowRight />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;