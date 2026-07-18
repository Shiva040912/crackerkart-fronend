import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiEye,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

import AdminSidebar from "../../components/AdminSidebar";
import {
  getAllOrders,
  processOrderRefund,
  updateAdminOrderStatus,
} from "../../api/order";

import "../../styles/adminCommon.css";
import "../../styles/adminOrder.css";

const Orders = () => {
  const adminUser = JSON.parse(
    localStorage.getItem("adminUser") || "{}"
  );

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [refundingId, setRefundingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await getAllOrders();

      setOrders(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName =
        order.user?.name?.toLowerCase() || "";

      const customerEmail =
        order.user?.email?.toLowerCase() || "";

      const customerPhone =
        order.user?.phone?.toLowerCase() ||
        order.deliveryAddress?.phone?.toLowerCase() ||
        "";

      const invoiceNumber =
        order.invoiceNumber?.toLowerCase() || "";

      const orderId =
        order._id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        customerPhone.includes(query) ||
        invoiceNumber.includes(query) ||
        orderId.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  const totalRevenue = orders
    .filter(
      (order) =>
        order.paymentStatus === "paid" &&
        order.orderStatus !== "cancelled"
    )
    .reduce(
      (total, order) =>
        total +
        Number(
          order.totalAmount ||
            order.grandTotal ||
            0
        ),
      0
    );

  const cancelledCount = orders.filter(
    (order) => order.orderStatus === "cancelled"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === "delivered"
  ).length;

  const refundPendingCount = orders.filter(
    (order) => order.refundStatus === "pending"
  ).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async (
    orderId,
    orderStatus
  ) => {
    try {
      setUpdatingId(orderId);

      await updateAdminOrderStatus(
        orderId,
        orderStatus
      );

      toast.success("Order status updated");
      await loadOrders();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Status update failed"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefund = async (order) => {
    const confirmed = window.confirm(
      `Refund ${formatCurrency(
        order.totalAmount || order.grandTotal
      )} for this order?`
    );

    if (!confirmed) return;

    try {
      setRefundingId(order._id);

      await processOrderRefund(order._id);

      toast.success("Refund initiated successfully");
      await loadOrders();

      if (selectedOrder?._id === order._id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Refund failed"
      );
    } finally {
      setRefundingId(null);
    }
  };

  const getStatusClass = (status) => {
    if (status === "delivered") return "delivered";
    if (status === "shipped") return "shipped";
    if (status === "cancelled") return "cancelled";

    return "confirmed";
  };

  const getPaymentClass = (status) => {
    if (status === "paid") return "paid";

    if (status === "refunded") {
      return "refunded";
    }

    if (
      status === "refund_pending" ||
      status === "pending"
    ) {
      return "pending";
    }

    return "failed";
  };

  const getRefundLabel = (order) => {
    if (order.refundStatus === "processed") {
      return "Refunded";
    }

    if (order.refundStatus === "pending") {
      return "Refund Pending";
    }

    if (order.refundStatus === "failed") {
      return "Refund Failed";
    }

    return "Not Requested";
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Order Management</h1>

            <p>
              Manage customer orders, delivery status
              and Razorpay refunds.
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

              <small>Administrator</small>
            </div>
          </div>
        </header>

        <section className="orders-summary-grid">
          <article className="orders-summary-card">
            <span className="orders-summary-icon total">
              <FiShoppingBag />
            </span>

            <div>
              <p>Total Orders</p>
              <strong>{orders.length}</strong>
            </div>
          </article>

          <article className="orders-summary-card">
            <span className="orders-summary-icon revenue">
              ₹
            </span>

            <div>
              <p>Total Revenue</p>
              <strong>
                {formatCurrency(totalRevenue)}
              </strong>
            </div>
          </article>

          <article className="orders-summary-card">
            <span className="orders-summary-icon delivered">
              <FiCheckCircle />
            </span>

            <div>
              <p>Delivered</p>
              <strong>{deliveredCount}</strong>
            </div>
          </article>

          <article className="orders-summary-card">
            <span className="orders-summary-icon cancelled">
              <FiXCircle />
            </span>

            <div>
              <p>Cancelled</p>
              <strong>{cancelledCount}</strong>
            </div>
          </article>

          <article className="orders-summary-card">
            <span className="orders-summary-icon refund">
              <FiRefreshCw />
            </span>

            <div>
              <p>Refund Pending</p>
              <strong>{refundPendingCount}</strong>
            </div>
          </article>
        </section>

        <section className="orders-management-panel">
          <div className="orders-toolbar">
            <div className="orders-search-box">
              <FiSearch />

              <input
                type="text"
                placeholder="Search customer, invoice or order ID..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">
                All Order Status
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              

              <option value="shipped">Shipped</option>

              <option value="delivered">
                Delivered
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

            <select
              value={paymentFilter}
              onChange={(event) =>
                setPaymentFilter(event.target.value)
              }
            >
              <option value="all">
                All Payment Status
              </option>

              <option value="paid">Paid</option>

              <option value="refund_pending">
                Refund Pending
              </option>

              <option value="refunded">
                Refunded
              </option>

              <option value="refund_failed">
                Refund Failed
              </option>
            </select>
          </div>

          <div className="orders-table-heading">
            <div>
              <h2>All Orders</h2>

              <p>
                {filteredOrders.length} order
                {filteredOrders.length === 1
                  ? ""
                  : "s"}{" "}
                shown
              </p>
            </div>
          </div>

          {loading ? (
            <div className="orders-empty-state">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty-state">
              No orders found
            </div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="admin-orders-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Refund</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <div className="order-invoice-cell">
                          <strong>
                            {order.invoiceNumber || "-"}
                          </strong>

                          <span>
                            {order._id?.slice(-8)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="order-customer-cell">
                          <strong>
                            {order.user?.name ||
                              order.deliveryAddress
                                ?.fullName ||
                              "Customer"}
                          </strong>

                          <span>
                            {order.user?.email ||
                              order.user?.phone ||
                              order.deliveryAddress
                                ?.phone ||
                              "-"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="order-items-count">
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) === 1
                            ? ""
                            : "s"}
                        </span>
                      </td>

                      <td>
                        <strong className="order-amount">
                          {formatCurrency(
                            order.totalAmount ||
                              order.grandTotal
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`order-payment-badge ${getPaymentClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus || "-"}
                        </span>
                      </td>

                      <td>
                        <select
                          className={`order-status-select ${getStatusClass(
                            order.orderStatus
                          )}`}
                          value={
                            order.orderStatus ||
                            "confirmed"
                          }
                          disabled={
                            updatingId === order._id ||
                            order.refundStatus ===
                              "processed"
                          }
                          onChange={(event) =>
                            handleStatusUpdate(
                              order._id,
                              event.target.value
                            )
                          }
                        >
                          <option value="confirmed">
                            Confirmed
                          </option>

                          

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </td>

                      <td>
                        <span
                          className={`order-refund-badge ${
                            order.refundStatus ||
                            "not_requested"
                          }`}
                        >
                          {getRefundLabel(order)}
                        </span>
                      </td>

                      <td>
                        {formatDate(order.createdAt)}
                      </td>

                      <td>
                        <div className="order-action-buttons">
                          <button
                            type="button"
                            className="order-view-button"
                            title="View Order"
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                          >
                            <FiEye />
                          </button>

                          {order.orderStatus ===
                            "cancelled" &&
                            order.paymentStatus !==
                              "refunded" &&
                            order.refundStatus !==
                              "processed" && (
                              <button
                                type="button"
                                className="order-refund-button"
                                disabled={
                                  refundingId ===
                                  order._id
                                }
                                onClick={() =>
                                  handleRefund(order)
                                }
                              >
                                <FiRefreshCw />

                                {refundingId ===
                                order._id
                                  ? "Processing"
                                  : "Refund"}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedOrder && (
        <div
          className="order-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <div className="order-details-modal">
            <div className="order-details-header">
              <div>
                <h2>Order Details</h2>

                <p>
                  {selectedOrder.invoiceNumber ||
                    selectedOrder._id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                <FiX />
              </button>
            </div>

            <div className="order-details-grid">
              <div className="order-details-card">
                <h3>Customer</h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {selectedOrder.user?.name ||
                    selectedOrder.deliveryAddress
                      ?.fullName ||
                    "-"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedOrder.user?.email || "-"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.user?.phone ||
                    selectedOrder.deliveryAddress
                      ?.phone ||
                    "-"}
                </p>
              </div>

              <div className="order-details-card">
                <h3>
                  <FiMapPin />
                  Delivery Address
                </h3>

                <p>
                  {
                    selectedOrder.deliveryAddress
                      ?.address
                  }
                </p>

                <p>
                  {
                    selectedOrder.deliveryAddress
                      ?.city
                  }{" "}
                  -{" "}
                  {
                    selectedOrder.deliveryAddress
                      ?.pincode
                  }
                </p>
              </div>

              <div className="order-details-card">
                <h3>Payment</h3>

                <p>
                  <strong>Status:</strong>{" "}
                  {selectedOrder.paymentStatus}
                </p>

                <p>
                  <strong>Payment ID:</strong>{" "}
                  {selectedOrder.razorpayPaymentId ||
                    "-"}
                </p>

                <p>
                  <strong>Refund ID:</strong>{" "}
                  {selectedOrder.razorpayRefundId ||
                    "-"}
                </p>
              </div>

              <div className="order-details-card">
                <h3>
                  <FiTruck />
                  Order Status
                </h3>

                <p>
                  <strong>Status:</strong>{" "}
                  {selectedOrder.orderStatus}
                </p>

                <p>
                  <strong>Refund:</strong>{" "}
                  {getRefundLabel(selectedOrder)}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {formatDate(
                    selectedOrder.createdAt
                  )}
                </p>
              </div>
            </div>

            <div className="order-items-section">
              <h3>Ordered Products</h3>

              {selectedOrder.items?.map(
                (item, index) => (
                  <div
                    className="order-item-detail-row"
                    key={
                      item._id ||
                      `${item.name}-${index}`
                    }
                  >
                    <div>
                      <strong>{item.name}</strong>

                      <span>
                        Quantity: {item.quantity}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>

            <div className="order-details-total">
              <span>Total Amount</span>

              <strong>
                {formatCurrency(
                  selectedOrder.totalAmount ||
                    selectedOrder.grandTotal
                )}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;