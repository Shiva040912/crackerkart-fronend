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
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");

    let cleanedValue = value;

    if (name === "fullName" || name === "city") {
      cleanedValue = value
        .replace(/[^A-Za-z\s]/g, "")
        .replace(/\s{2,}/g, " ");
    }

    if (name === "phone") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "pincode") {
      cleanedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    if (name === "address") {
      cleanedValue = value.slice(0, 200);
    }

    setDeliveryAddress((currentAddress) => ({
      ...currentAddress,
      [name]: cleanedValue,
    }));
  };

  const validateAddress = () => {
    const fullName = deliveryAddress.fullName.trim();
    const phone = deliveryAddress.phone.trim();
    const address = deliveryAddress.address.trim();
    const city = deliveryAddress.city.trim();
    const pincode = deliveryAddress.pincode.trim();

    if (!fullName) {
      setError("Full name is required");
      return false;
    }

    if (fullName.length < 3) {
      setError("Full name must contain at least 3 characters");
      return false;
    }

    if (fullName.length > 50) {
      setError("Full name cannot exceed 50 characters");
      return false;
    }

    if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(fullName)) {
      setError("Full name must contain letters and spaces only");
      return false;
    }

    if (!phone) {
      setError("Phone number is required");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10 digit Indian phone number");
      return false;
    }

    if (!address) {
      setError("Address is required");
      return false;
    }

    if (address.length < 10) {
      setError("Address must contain at least 10 characters");
      return false;
    }

    if (address.length > 200) {
      setError("Address cannot exceed 200 characters");
      return false;
    }

    if (!city) {
      setError("City is required");
      return false;
    }

    if (city.length < 2) {
      setError("City name must contain at least 2 characters");
      return false;
    }

    if (city.length > 40) {
      setError("City name cannot exceed 40 characters");
      return false;
    }

    if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(city)) {
      setError("City name must contain letters and spaces only");
      return false;
    }

    if (!pincode) {
      setError("Pincode is required");
      return false;
    }

    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError("Enter a valid 6 digit pincode");
      return false;
    }

    setDeliveryAddress({
      fullName,
      phone,
      address,
      city,
      pincode,
    });

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

      const paymentRes = await createPayment({
        deliveryAddress,
      });

      const paymentData = paymentRes.data;

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

            window.dispatchEvent(new Event("cartUpdated"));

            navigate("/orders");
          } catch (err) {
            console.log("Payment verification error:", err);

            setError(
              err.response?.data?.message || "Payment verification failed",
            );

            setLoading(false);
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
        console.log("Razorpay payment failed:", response.error);

        setError(
          response.error?.description || "Payment failed. Please try again.",
        );

        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      console.log("Create payment error:", err);

      setError(err.response?.data?.message || "Unable to create payment");

      setLoading(false);
    }
  };

  const handleTestPayment = async () => {
    if (!validateAddress()) return;

    try {
      setLoading(true);
      setError("");

      await testPayment({
        deliveryAddress,
      });

      window.dispatchEvent(new Event("cartUpdated"));

      navigate("/orders");
    } catch (err) {
      console.log("Test payment error:", err);

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

          <span>
            Enter your delivery details and continue to payment.
          </span>
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

            {error && (
              <div className="checkout-error">
                {error}
              </div>
            )}

            <div className="checkout-form-grid">
              <div className="checkout-form-group">
                <label htmlFor="fullName">Full Name</label>

                <div className="checkout-input">
                  <FiUser />

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter full name"
                    value={deliveryAddress.fullName}
                    onChange={handleChange}
                    minLength={3}
                    maxLength={50}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label htmlFor="phone">Phone Number</label>

                <div className="checkout-input">
                  <FiPhone />

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="10 digit phone number"
                    value={deliveryAddress.phone}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="checkout-form-group full-width">
                <label htmlFor="address">Address</label>

                <div className="checkout-input textarea-input">
                  <FiHome />

                  <textarea
                    id="address"
                    rows="4"
                    name="address"
                    placeholder="House number, street, area and landmark"
                    value={deliveryAddress.address}
                    onChange={handleChange}
                    minLength={10}
                    maxLength={200}
                    autoComplete="street-address"
                  />
                </div>

                <small>
                  {deliveryAddress.address.length}/200 characters
                </small>
              </div>

              <div className="checkout-form-group">
                <label htmlFor="city">City</label>

                <div className="checkout-input">
                  <FiMapPin />

                  <input
                    id="city"
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={deliveryAddress.city}
                    onChange={handleChange}
                    minLength={2}
                    maxLength={40}
                    autoComplete="address-level2"
                  />
                </div>
              </div>

              <div className="checkout-form-group">
                <label htmlFor="pincode">Pincode</label>

                <div className="checkout-input">
                  <FiMapPin />

                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    placeholder="6 digit pincode"
                    value={deliveryAddress.pincode}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[1-9][0-9]{5}"
                    maxLength={6}
                    autoComplete="postal-code"
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

              <span>
                100% secure payment powered by Razorpay
              </span>
            </div>

            <button
              type="button"
              className="pay-now-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed To Payment"}
            </button>

            <button
              type="button"
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