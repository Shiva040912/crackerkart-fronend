import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiCreditCard,
  FiShield,
} from "react-icons/fi";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { createPayment, verifyPayment, testPayment } from "../../api/order";
import "../../styles/checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    setError("");
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value,
    });
  };

  const validateAddress = () => {
    if (!deliveryAddress.fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    if (!/^[0-9]{10}$/.test(deliveryAddress.phone)) {
      setError("Enter valid 10 digit phone number");
      return false;
    }

    if (!deliveryAddress.address.trim()) {
      setError("Address is required");
      return false;
    }

    if (!deliveryAddress.city.trim()) {
      setError("City is required");
      return false;
    }

    if (!/^[0-9]{6}$/.test(deliveryAddress.pincode)) {
      setError("Enter valid 6 digit pincode");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateAddress()) return;

    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded. Refresh the page and try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const paymentRes = await createPayment({ deliveryAddress });
      const paymentData = paymentRes.data;

      console.log("PAYMENT DATA:", paymentData);

      const options = {
        key: paymentData.key,
        amount: Number(paymentData.amount),
        currency: paymentData.currency || "INR",
        name: "Japan Pattasu",
        description: "Order Payment",
        order_id: paymentData.razorpayOrderId,

        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              deliveryAddress,
            });

            navigate("/orders");
          } catch (err) {
            console.log(err);
            setError(
              err.response?.data?.message || "Payment verification failed",
            );
          }
        },

        prefill: {
          name: deliveryAddress.fullName,
          contact: deliveryAddress.phone,
        },

        theme: {
          color: "#f6a609",
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.log("RAZORPAY FAILED:", response.error);
        setError(
          response.error?.description || "Payment failed. Please try again.",
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Unable to create payment");
      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    if (!validateAddress()) return;

    try {
      setLoading(true);
      setError("");

      await testPayment({ deliveryAddress });

      window.dispatchEvent(new Event("cartUpdated"));

      navigate("/orders");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Test payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <section className="checkout-header">
          <p>Secure Checkout</p>
          <h1>Complete Your Order</h1>
          <span>Enter your delivery details and continue to payment.</span>
        </section>

        <section className="checkout-layout">
          <div className="checkout-card">
            <div className="checkout-card-title">
              <FiMapPin />
              <div>
                <h2>Delivery Address</h2>
                <p>We will deliver your order to this address.</p>
              </div>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <div className="checkout-form-grid">
              <div className="checkout-form-group">
                <label>Full Name</label>
                <div className="checkout-input">
                  <FiUser />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Enter full name"
                    value={deliveryAddress.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label>Phone Number</label>
                <div className="checkout-input">
                  <FiPhone />
                  <input
                    type="text"
                    name="phone"
                    placeholder="10 digit phone number"
                    value={deliveryAddress.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkout-form-group full-width">
                <label>Address</label>
                <div className="checkout-input textarea-input">
                  <FiHome />
                  <textarea
                    rows="4"
                    name="address"
                    placeholder="House no, street, area"
                    value={deliveryAddress.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label>City</label>
                <div className="checkout-input">
                  <FiMapPin />
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={deliveryAddress.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label>Pincode</label>
                <div className="checkout-input">
                  <FiMapPin />
                  <input
                    type="text"
                    name="pincode"
                    placeholder="6 digit pincode"
                    value={deliveryAddress.pincode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="checkout-summary">
            <div className="summary-icon">
              <FiCreditCard />
            </div>

            <h2>Payment</h2>
            <p>
              Your final amount will be calculated securely from your cart.
              Delivery is free above ₹1000.
            </p>

            <div className="secure-box">
              <FiShield />
              <span>100% secure payment powered by Razorpay</span>
            </div>

            <button
              className="pay-now-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed To Payment"}
            </button>

            <button
              className="test-pay-btn"
              onClick={handleTestPayment}
              disabled={loading}
            >
              Test Payment Success
            </button>
          </aside>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;
