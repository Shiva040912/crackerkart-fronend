import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMail,
  FiPhone,
  FiSearch,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";

import "../../styles/admincommon.css";
import "../../styles/admincustomer.css";

const Customers = () => {
  const navigate = useNavigate();

  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/customers");

      setCustomers(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const customerName = customer.name?.toLowerCase() || "";
      const customerEmail = customer.email?.toLowerCase() || "";
      const customerPhone = customer.phone?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        customerPhone.includes(query);

      const providers = Array.isArray(customer.authProviders)
        ? customer.authProviders
        : [];

      const matchesProvider =
        providerFilter === "all" ||
        providers.includes(providerFilter);

      return matchesSearch && matchesProvider;
    });
  }, [customers, search, providerFilter]);

  const emailCustomers = customers.filter((customer) =>
    customer.authProviders?.includes("local")
  ).length;

  const googleCustomers = customers.filter((customer) =>
    customer.authProviders?.includes("google")
  ).length;

  const phoneCustomers = customers.filter((customer) =>
    customer.authProviders?.includes("phone")
  ).length;

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "C";

    return name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getProviderLabel = (provider) => {
    if (provider === "local") return "Email";
    if (provider === "google") return "Google";
    if (provider === "phone") return "Phone";

    return provider;
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Customer Management</h1>
            <p>
              View all customers registered using email, Google,
              or phone login.
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

        <section className="customer-summary-grid">
          <article className="customer-summary-card">
            <span className="customer-summary-icon total">
              <FiUsers />
            </span>

            <div>
              <p>Total Customers</p>
              <strong>{customers.length}</strong>
            </div>
          </article>

          <article className="customer-summary-card">
            <span className="customer-summary-icon email">
              <FiMail />
            </span>

            <div>
              <p>Email Login</p>
              <strong>{emailCustomers}</strong>
            </div>
          </article>

          <article className="customer-summary-card">
            <span className="customer-summary-icon google">
              G
            </span>

            <div>
              <p>Google Login</p>
              <strong>{googleCustomers}</strong>
            </div>
          </article>

          <article className="customer-summary-card">
            <span className="customer-summary-icon phone">
              <FiPhone />
            </span>

            <div>
              <p>Phone Login</p>
              <strong>{phoneCustomers}</strong>
            </div>
          </article>
        </section>

        <section className="customer-management-panel">
          <div className="customer-toolbar">
            <div className="customer-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search customer name, email or phone..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={providerFilter}
              onChange={(event) =>
                setProviderFilter(event.target.value)
              }
            >
              <option value="all">
                All Login Methods
              </option>

              <option value="local">Email Login</option>

              <option value="google">Google Login</option>

              <option value="phone">Phone Login</option>
            </select>
          </div>

          <div className="customer-table-heading">
            <div>
              <h2>Registered Customers</h2>

              <p>
                {filteredCustomers.length} customer
                {filteredCustomers.length === 1 ? "" : "s"} shown
              </p>
            </div>
          </div>

          {loading ? (
            <div className="customer-empty-state">
              Loading customers...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="customer-empty-state">
              No customers found
            </div>
          ) : (
            <div className="customer-table-wrapper">
              <table className="admin-customer-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Login Method</th>
                    <th>Phone Status</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="customer-profile-cell">
                          {customer.profileImage ? (
                            <img
                              src={customer.profileImage}
                              alt={customer.name || "Customer"}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="customer-avatar">
                              {getInitials(customer.name)}
                            </span>
                          )}

                          <div>
                            <strong>
                              {customer.name || "Customer"}
                            </strong>

                            <span>Customer Account</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="customer-contact">
                          <FiMail />
                          {customer.email || "-"}
                        </span>
                      </td>

                      <td>
                        <span className="customer-contact">
                          <FiPhone />
                          {customer.phone || "-"}
                        </span>
                      </td>

                      <td>
                        <div className="customer-provider-list">
                          {customer.authProviders?.length > 0 ? (
                            customer.authProviders.map((provider) => (
                              <span
                                key={provider}
                                className={`customer-provider-badge ${provider}`}
                              >
                                {getProviderLabel(provider)}
                              </span>
                            ))
                          ) : (
                            <span className="customer-provider-empty">
                              -
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`customer-verification-badge ${
                            customer.isPhoneVerified
                              ? "verified"
                              : "not-verified"
                          }`}
                        >
                          <FiShield />

                          {customer.isPhoneVerified
                            ? "Verified"
                            : "Not Verified"}
                        </span>
                      </td>

                      <td>{formatDate(customer.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Customers;