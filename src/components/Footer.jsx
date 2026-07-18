import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiShield,
  FiFileText,
  FiTruck,
  FiCheckCircle,
} from "react-icons/fi";
import logoImg from "../assets/logo-go.png";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        

        <div className="footer-column">
          <div className="footer-brand">
            <img src={logoImg} alt="Japan Pattasu" />

            <h2>Japan Pattasu</h2>
          </div>

          <p>
            Premium fireworks and celebration products from Sivakasi, delivering
            quality, safety and happiness for every festival.
          </p>
        </div>

        

        <div className="footer-column">
          <h3>About Us</h3>

          <p>
            Japan Pattasu is a trusted fireworks store offering premium
            crackers, festival combo packs and celebration essentials with
            quality assurance and reliable delivery.
          </p>
        </div>

        

        <div className="footer-column">
          <h3>Contact Us</h3>

          <p>
            <FiMapPin /> No.18, Fireworks Industrial Estate, Sivakasi, Tamil
            Nadu - 626123
          </p>

          <p>
            <FiPhone /> +91 98765 43210
          </p>

          <p>
            <FiMail /> support@japanpattasu.com
          </p>
        </div>

        

        <div className="footer-column">
          <h3>Privacy & Terms</h3>

          <p>
            <FiShield /> Customer information is protected and never shared with
            third parties.
          </p>

          <p>
            <FiFileText /> Products are sold according to Government fireworks
            safety guidelines and regulations.
          </p>
        </div>
      </div>
      <div className="footer-trust">
        <div className="trust-item">
          <FiShield />
          <span>100% Secure Payments</span>
        </div>

        <div className="trust-item">
          <FiCheckCircle />
          <span>Quality Assured Products</span>
        </div>

        <div className="trust-item">
          <FiTruck />
          <span>Fast Delivery Across Tamil Nadu</span>
        </div>
      </div>

      <div className="payment-methods">
        <h4>Accepted Payments</h4>

        <div className="payment-list">
          
          <span>Visa</span>
          <span>Mastercard</span>
          <span>RuPay</span>
          <span>Net Banking</span>
          <span>Razorpay Secure</span>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Japan Pattasu. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
