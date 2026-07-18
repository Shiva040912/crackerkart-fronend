import { useCallback, useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FiCheckCircle,
  FiDownload,
  FiEye,
  FiFileText,
  FiRefreshCw,
  FiTrash2,
  FiTruck,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

import {
  cancelOrder,
  clearCancelledOrders,
  getMyOrders,
} from "../../api/order";

import socket from "../../service/socket";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import logoImg from "../../assets/bg-logo.png";

import "../../styles/orders.css";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [openOrderId, setOpenOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const loadOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await getMyOrders();

      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    loadOrders();

    const handleOrderUpdated = () => {
      loadOrders(false);
    };

    socket.on("orderUpdated", handleOrderUpdated);

    return () => {
      socket.off("orderUpdated", handleOrderUpdated);
    };
  }, [loadOrders]);

  const getLogoBase64 = async () => {
    const response = await fetch(logoImg);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  };

  const getOrderAmount = (order) => {
    return Number(order.totalAmount || order.grandTotal || 0);
  };

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

  const getOrderProgress = (status) => {
    switch (status) {
      case "confirmed":
        return 25;

      case "packed":
        return 50;

      case "shipped":
        return 75;

      case "delivered":
        return 100;

      default:
        return 0;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "confirmed":
        return "Order Confirmed";

      case "packed":
        return "Order Packed";

      case "shipped":
        return "Order Shipped";

      case "delivered":
        return "Order Delivered";

      case "cancelled":
        return "Order Cancelled";

      default:
        return "Order Received";
    }
  };

  const getRefundDetails = (order) => {
    if (
      order.refundStatus === "processed" ||
      order.paymentStatus === "refunded"
    ) {
      return {
        label: "Refund Collected",
        className: "success",
        icon: <FiCheckCircle />,
      };
    }

    if (
      order.refundStatus === "pending" ||
      order.paymentStatus === "refund_pending"
    ) {
      return {
        label: "Refund Pending",
        className: "pending",
        icon: <FiRefreshCw />,
      };
    }

    if (
      order.refundStatus === "failed" ||
      order.paymentStatus === "refund_failed"
    ) {
      return {
        label: "Refund Failed",
        className: "failed",
        icon: <FiXCircle />,
      };
    }

    return null;
  };

  const downloadInvoice = async (order) => {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const address = order.deliveryAddress || {};
      const logoBase64 = await getLogoBase64();

      const subtotal = (order.items || []).reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      );

      const totalAmount = getOrderAmount(order);

      const deliveryCharge = Math.max(totalAmount - subtotal, 0);

      const invoiceNumber = order.invoiceNumber || "N/A";

      const orderId = order._id || "N/A";

      const customerName = address.fullName || "Customer";

      const customerPhone = address.phone || "N/A";

      const customerAddress = [address.address, address.city, address.pincode]
        .filter(Boolean)
        .join(", ");

      const currencyText = (amount) =>
        `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;

      /*
       * PAGE BACKGROUND
       */
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      /*
       * MAIN WHITE CONTAINER
       */
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");

      /*
       * HEADER
       */
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(8, 8, pageWidth - 16, 46, 4, 4, "F");

      doc.setFillColor(15, 23, 42);
      doc.rect(8, 38, pageWidth - 16, 16, "F");

      doc.addImage(logoBase64, "JPEG", 16, 16, 28, 28);

      doc.setTextColor(245, 158, 11);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);

      doc.text("JAPAN PATTASU", 50, 25);

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text("Premium Fireworks Store", 50, 32);

      doc.text("Celebrate Safely. Celebrate Brightly.", 50, 38);

      doc.setFontSize(8.5);

      doc.text("Sivakasi, Tamil Nadu", pageWidth - 16, 20, {
        align: "right",
      });

      doc.text("Phone: +91 98765 43210", pageWidth - 16, 27, {
        align: "right",
      });

      doc.text("support@japanpattasu.com", pageWidth - 16, 34, {
        align: "right",
      });

      doc.text("www.japanpattasu.com", pageWidth - 16, 41, {
        align: "right",
      });

      /*
       * INVOICE TITLE BAR
       */
      doc.setFillColor(245, 158, 11);
      doc.rect(8, 54, pageWidth - 16, 11, "F");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      doc.text("TAX INVOICE / BILL", pageWidth / 2, 61.5, {
        align: "center",
      });

      /*
       * INVOICE DETAILS
       */
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");

      doc.text("Invoice Number", 16, 76);

      doc.setFont("helvetica", "bold");

      doc.text(invoiceNumber, 16, 82);

      doc.setFont("helvetica", "normal");

      doc.text("Order ID", 78, 76);

      doc.setFont("helvetica", "bold");

      const shortOrderId =
        orderId.length > 22 ? `${orderId.slice(0, 22)}...` : orderId;

      doc.text(shortOrderId, 78, 82);

      doc.setFont("helvetica", "normal");

      doc.text("Invoice Date", 151, 76);

      doc.setFont("helvetica", "bold");

      doc.text(formatDate(order.createdAt), pageWidth - 16, 82, {
        align: "right",
      });

      /*
       * CUSTOMER + PAYMENT CARDS
       */
      doc.setFillColor(248, 250, 252);

      doc.roundedRect(16, 91, 112, 43, 3, 3, "F");

      doc.roundedRect(134, 91, 60, 43, 3, 3, "F");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("Bill To", 21, 100);

      doc.text("Payment Details", 139, 100);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);

      doc.text(customerName, 21, 108);

      doc.text(`Phone: ${customerPhone}`, 21, 115);

      const addressLines = doc.splitTextToSize(customerAddress || "N/A", 100);

      doc.text(addressLines.slice(0, 2), 21, 122);

      doc.text("Method", 139, 109);

      doc.setFont("helvetica", "bold");

      doc.text("Razorpay", 190, 109, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");

      doc.text("Payment", 139, 117);

      doc.setTextColor(21, 128, 61);
      doc.setFont("helvetica", "bold");

      doc.text(String(order.paymentStatus || "paid").toUpperCase(), 190, 117, {
        align: "right",
      });

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");

      doc.text("Order Status", 139, 125);

      doc.setFont("helvetica", "bold");

      doc.text(
        String(order.orderStatus || "confirmed").toUpperCase(),
        190,
        125,
        {
          align: "right",
        },
      );

      /*
       * PRODUCT TABLE
       */
      autoTable(doc, {
        startY: 143,

        margin: {
          left: 16,
          right: 16,
        },

        head: [["S.No", "Product Description", "Qty", "Unit Price", "Amount"]],

        body: (order.items || []).map((item, index) => [
          index + 1,
          item.name || "Product",
          Number(item.quantity || 0),
          currencyText(item.price),
          currencyText(Number(item.price || 0) * Number(item.quantity || 0)),
        ]),

        theme: "grid",

        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [245, 158, 11],
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          lineWidth: 0,
        },

        bodyStyles: {
          textColor: [30, 41, 59],
          valign: "middle",
          lineColor: [226, 232, 240],
          lineWidth: 0.2,
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        styles: {
          font: "helvetica",
          fontSize: 9.5,
          cellPadding: 4,
          overflow: "linebreak",
        },

        columnStyles: {
          0: {
            cellWidth: 14,
            halign: "center",
          },

          1: {
            cellWidth: 78,
            halign: "left",
          },

          2: {
            cellWidth: 18,
            halign: "center",
          },

          3: {
            cellWidth: 34,
            halign: "right",
          },

          4: {
            cellWidth: 34,
            halign: "right",
          },
        },
      });

      const finalTableY = doc.lastAutoTable?.finalY || 143;

      let summaryY = finalTableY + 10;

      /*
       * PAGE OVERFLOW PROTECTION
       */
      if (summaryY > 220) {
        doc.addPage();

        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, "F");

        summaryY = 22;
      }

      /*
       * PAYMENT SUMMARY
       */
      doc.setFillColor(248, 250, 252);

      doc.roundedRect(118, summaryY, 76, 55, 3, 3, "F");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text("Subtotal", 124, summaryY + 10);

      doc.text(currencyText(subtotal), 188, summaryY + 10, {
        align: "right",
      });

      doc.text("Delivery Charge", 124, summaryY + 19);

      doc.text(
        deliveryCharge === 0 ? "FREE" : currencyText(deliveryCharge),
        188,
        summaryY + 19,
        {
          align: "right",
        },
      );

      doc.text("Discount", 124, summaryY + 28);

      doc.text(currencyText(0), 188, summaryY + 28, {
        align: "right",
      });

      doc.text("GST", 124, summaryY + 37);

      doc.text("Included", 188, summaryY + 37, {
        align: "right",
      });

      doc.setDrawColor(203, 213, 225);
      doc.line(124, summaryY + 42, 188, summaryY + 42);

      doc.setFillColor(15, 23, 42);

      doc.roundedRect(122, summaryY + 45, 68, 15, 3, 3, "F");

      doc.setTextColor(245, 158, 11);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text("Grand Total", 127, summaryY + 54);

      doc.text(currencyText(totalAmount), 186, summaryY + 54, {
        align: "right",
      });

      /*
       * STATUS BOX
       */
      doc.setFillColor(236, 253, 245);

      doc.roundedRect(16, summaryY, 88, 35, 3, 3, "F");

      doc.setTextColor(21, 128, 61);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.text(
        order.paymentStatus === "refunded"
          ? "PAYMENT REFUNDED"
          : "PAYMENT SUCCESSFUL",
        22,
        summaryY + 12,
      );

      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text("Your payment has been securely processed.", 22, summaryY + 21);

      doc.text(
        `Transaction ID: ${order.razorpayPaymentId || "N/A"}`,
        22,
        summaryY + 29,
      );

      /*
       * TERMS
       */
      const termsY = summaryY + 72;

      if (termsY < pageHeight - 42) {
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);

        doc.text("Terms & Notes", 16, termsY);

        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);

        doc.text(
          "1. Please retain this invoice for future reference.",
          16,
          termsY + 7,
        );

        doc.text(
          "2. Products once delivered are subject to the applicable cancellation and refund policy.",
          16,
          termsY + 13,
        );

        doc.text(
          "3. Handle fireworks responsibly and follow all safety instructions.",
          16,
          termsY + 19,
        );
      }

      /*
       * FOOTER
       */
      doc.setFillColor(15, 23, 42);

      doc.rect(8, pageHeight - 31, pageWidth - 16, 23, "F");

      doc.setTextColor(245, 158, 11);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);

      doc.text(
        "Thank You For Shopping With Japan Pattasu!",
        16,
        pageHeight - 20,
      );

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      doc.text(
        "Light up your celebrations safely and responsibly.",
        16,
        pageHeight - 14,
      );

      doc.text(
        "This is a computer-generated invoice.",
        pageWidth - 16,
        pageHeight - 20,
        {
          align: "right",
        },
      );

      doc.text(
        `Generated on: ${formatDate(new Date())}`,
        pageWidth - 16,
        pageHeight - 14,
        {
          align: "right",
        },
      );

      doc.save(`${invoiceNumber}.pdf`);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Invoice generation error:", error);

      toast.error("Invoice download failed");
    }
  };

  const handleCancel = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      setCancellingId(orderId);

      const response = await cancelOrder(orderId);

      toast.success(response.data?.message || "Order cancelled successfully");

      await loadOrders(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Order cancellation failed");
    } finally {
      setCancellingId(null);
    }
  };

  const handleClearCancelled = async () => {
    const confirmed = window.confirm(
      "Clear eligible cancelled orders from history?",
    );

    if (!confirmed) return;

    try {
      setClearingHistory(true);

      const response = await clearCancelledOrders();

      toast.success(
        response.data?.message || "Cancelled order history cleared",
      );

      await loadOrders(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to clear cancelled history",
      );
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="orders-page">
        <div className="orders-top">
          <div>
            <p>Order History</p>
            <h1>My Orders</h1>
          </div>

          <button
            type="button"
            className="clear-history-btn"
            disabled={clearingHistory}
            onClick={handleClearCancelled}
          >
            <FiTrash2 />

            {clearingHistory ? "Clearing..." : "Clear Cancelled History"}
          </button>
        </div>

        {loading ? (
          <div className="no-orders-box">
            <FiRefreshCw className="orders-loading-icon" />
            <h2>Loading orders...</h2>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-orders-box">
            <FiFileText />
            <h2>No orders found</h2>
            <p>Your completed orders will appear here.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isOpen = openOrderId === order._id;

              const progress = getOrderProgress(order.orderStatus);

              const refundDetails = getRefundDetails(order);

              const canCancel =
                !["cancelled", "shipped", "delivered"].includes(
                  order.orderStatus,
                ) && order.refundStatus !== "processed";

              return (
                <article className="order-card" key={order._id}>
                  <div className="order-main-row">
                    <div>
                      <span className="small-label">Invoice</span>

                      <h3>{order.invoiceNumber || order._id}</h3>
                    </div>

                    <div>
                      <span className="small-label">Status</span>

                      <span
                        className={`customer-status-badge ${
                          order.orderStatus || "confirmed"
                        }`}
                      >
                        {getStatusMessage(order.orderStatus)}
                      </span>
                    </div>

                    <div>
                      <span className="small-label">Amount</span>

                      <h3>{formatCurrency(getOrderAmount(order))}</h3>
                    </div>

                    <button
                      type="button"
                      className="view-details-btn"
                      onClick={() => setOpenOrderId(isOpen ? null : order._id)}
                    >
                      {isOpen ? <FiX /> : <FiEye />}

                      {isOpen ? "Close" : "View Details"}
                    </button>
                  </div>

                  <div className="customer-order-summary">
                    {order.orderStatus !== "cancelled" && (
                      <div className="customer-order-progress-wrap">
                        <div className="customer-order-progress-info">
                          <span>Order Progress</span>
                          <strong>{progress}%</strong>
                        </div>

                        <div className="customer-progress">
                          <div
                            className="customer-progress-fill"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <div className="customer-order-steps">
                          <span className={progress >= 25 ? "completed" : ""}>
                            Confirmed
                          </span>

                          <span className={progress >= 75 ? "completed" : ""}>
                            Shipped
                          </span>

                          <span className={progress >= 100 ? "completed" : ""}>
                            Delivered
                          </span>
                        </div>
                      </div>
                    )}

                    {refundDetails && (
                      <div
                        className={`refund-badge ${refundDetails.className}`}
                      >
                        {refundDetails.icon}
                        {refundDetails.label}
                      </div>
                    )}
                  </div>

                  {isOpen && (
                    <div className="order-expanded">
                      <button
                        type="button"
                        className="close-expanded-btn"
                        onClick={() => setOpenOrderId(null)}
                      >
                        <FiX />
                      </button>

                      <div className="order-info-grid">
                        <p>
                          <strong>Order ID:</strong> {order._id}
                        </p>

                        <p>
                          <strong>Date:</strong> {formatDate(order.createdAt)}
                        </p>

                        <p>
                          <strong>Payment:</strong> {order.paymentStatus || "-"}
                        </p>

                        <p>
                          <strong>Order Status:</strong>{" "}
                          {order.orderStatus || "-"}
                        </p>

                        <p>
                          <strong>Refund Status:</strong>{" "}
                          {refundDetails?.label || "Not Requested"}
                        </p>

                        {order.razorpayRefundId && (
                          <p>
                            <strong>Refund ID:</strong> {order.razorpayRefundId}
                          </p>
                        )}
                      </div>

                      <div className="order-address-box">
                        <h4>Delivery Address</h4>

                        <p>{order.deliveryAddress?.fullName}</p>

                        <p>{order.deliveryAddress?.phone}</p>

                        <p>{order.deliveryAddress?.address}</p>

                        <p>
                          {order.deliveryAddress?.city} -{" "}
                          {order.deliveryAddress?.pincode}
                        </p>
                      </div>

                      <div className="order-items-box">
                        <h4>Items</h4>

                        {order.items?.map((item, index) => (
                          <div
                            className="order-item-row"
                            key={item._id || `${item.name}-${index}`}
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>

                            <span>
                              {formatCurrency(
                                Number(item.price || 0) *
                                  Number(item.quantity || 0),
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {["shipped", "delivered", "cancelled"].includes(
                        order.orderStatus,
                      ) && (
                        <div className="customer-order-state-box">
                          {order.orderStatus === "shipped" && (
                            <>
                              <FiTruck />

                              <div>
                                <strong>Order is on the way</strong>

                                <p>Your order has been shipped.</p>
                              </div>
                            </>
                          )}

                          {order.orderStatus === "delivered" && (
                            <>
                              <FiCheckCircle />

                              <div>
                                <strong>Order delivered</strong>

                                <p>Delivery completed successfully.</p>
                              </div>
                            </>
                          )}

                          {order.orderStatus === "cancelled" && (
                            <>
                              <FiXCircle />

                              <div>
                                <strong>Order cancelled</strong>

                                <p>Check the refund status shown above.</p>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <div className="order-action-row">
                        <button
                          type="button"
                          className="invoice-btn"
                          onClick={() => downloadInvoice(order)}
                        >
                          <FiDownload />
                          Download Invoice
                        </button>

                        {canCancel && (
                          <button
                            type="button"
                            className="cancel-order-btn"
                            disabled={cancellingId === order._id}
                            onClick={() => handleCancel(order._id)}
                          >
                            <FiX />

                            {cancellingId === order._id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default MyOrders;
