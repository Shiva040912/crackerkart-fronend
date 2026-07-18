import {
  FiPackage,
  FiTruck,
  FiUsers,
  FiShield,
} from "react-icons/fi";
import "../styles/stats.css";

const Stats = () => {
  return (
    <section className="stats-section">
      <div className="stats-header">
        <p>Why Choose Us</p>
        <h2>Trusted by Celebration Lovers</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FiPackage className="stat-icon" />
          <h3>500+</h3>
          <p>Products</p>
        </div>

        <div className="stat-card">
          <FiTruck className="stat-icon" />
          <h3>Fast</h3>
          <p>Delivery Support</p>
        </div>

        <div className="stat-card">
          <FiUsers className="stat-icon" />
          <h3>10K+</h3>
          <p>Happy Customers</p>
        </div>

        <div className="stat-card">
          <FiShield className="stat-icon" />
          <h3>Safe</h3>
          <p>Quality Checked</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;