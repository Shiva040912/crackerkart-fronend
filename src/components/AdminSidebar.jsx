import { useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiPackage,
  FiUsers,
  FiArchive,
  FiShoppingBag,
  FiUserPlus,
  FiLogOut,
} from "react-icons/fi";
import toast from "react-hot-toast";

import logo from "../assets/logo-go.png";

const menus = {
  super_admin: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: FiHome,
    },
    {
      label: "Employees",
      path: "/admin/employees",
      icon: FiUserPlus,
    },
    {
      label: "Customers",
      path: "/admin/customers",
      icon: FiUsers,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: FiShoppingBag,
    },
    {
      label: "Stock",
      path: "/admin/stock",
      icon: FiArchive,
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: FiPackage,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: FiGrid,
    },
  ],

  admin: [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: FiHome,
    },
    {
      label: "Categories",
      path: "/admin/categories",
      icon: FiGrid,
    },
    {
      label: "Products",
      path: "/admin/products",
      icon: FiPackage,
    },
  ],

  inventory: [
    {
      label: "Products",
      path: "/admin/products",
      icon: FiPackage,
    },
     {
      label: "Categories",
      path: "/admin/categories",
      icon: FiGrid,
    },
    {
      label: "Stock",
      path: "/admin/stock",
      icon: FiArchive,
    },
  ],

  orders: [
    {
      label: "Orders",
      path: "/admin/orders",
      icon: FiShoppingBag,
    },
  ],

  customer_support: [
    {
      label: "Customers",
      path: "/admin/customers",
      icon: FiUsers,
    },
    {
      label: "Orders",
      path: "/admin/orders",
      icon: FiShoppingBag,
    },
  ],
};

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  let adminUser = null;

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser"));
  } catch {
    adminUser = null;
  }

  const department = adminUser?.department;
  const currentMenus = menus[department] || [];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    toast.success("Logged out successfully");

    navigate("/admin/login", {
      replace: true,
    });
  };

  const getDepartmentName = () => {
    return String(department || "Admin")
      .replaceAll("_", " ")
      .toUpperCase();
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-center">
          <div className="admin-logo-wrapper">
            <img
              src={logo}
              alt="Japan Pattasu Logo"
              className="admin-company-logo"
            />
          </div>

          <div className="admin-brand-text">
            <h2>Japan Pattasu</h2>
            <p>{getDepartmentName()}</p>
          </div>
        </div>

        <button
          type="button"
          className="admin-desktop-logout"
          onClick={handleLogout}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>

        <button
          type="button"
          className="admin-mobile-logout"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <FiLogOut />
        </button>
      </div>

      <nav
        className={`admin-nav ${
          currentMenus.length <= 3 ? "admin-nav-compact" : ""
        }`}
      >
        {currentMenus.map((menu) => {
          const Icon = menu.icon;

          const isActive =
            location.pathname === menu.path ||
            location.pathname.startsWith(`${menu.path}/`);

          return (
            <button
              type="button"
              key={menu.path}
              className={isActive ? "active" : ""}
              onClick={() => navigate(menu.path)}
              aria-label={menu.label}
              title={menu.label}
            >
              <Icon />
              <span>{menu.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;