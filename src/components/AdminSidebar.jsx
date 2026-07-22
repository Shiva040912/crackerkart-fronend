import { useEffect, useRef } from "react";
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
      label: "Stock",
      path: "/admin/stock",
      icon: FiArchive,
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
    {
      label: "Orders",
      path: "/admin/orders",
      icon: FiShoppingBag,
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

  const navRef = useRef(null);

  let adminUser = null;

  try {
    adminUser = JSON.parse(localStorage.getItem("adminUser"));
  } catch {
    adminUser = null;
  }

  const department = adminUser?.department;
  const currentMenus = menus[department] || [];

  useEffect(() => {
    if (window.innerWidth > 820) return;

    const navElement = navRef.current;

    if (!navElement) return;

    const activeButton = navElement.querySelector("button.active");

    if (!activeButton) return;

    const scrollTimer = setTimeout(() => {
      const navRect = navElement.getBoundingClientRect();
      const activeButtonRect = activeButton.getBoundingClientRect();

      const isOutsideLeft = activeButtonRect.left < navRect.left;
      const isOutsideRight = activeButtonRect.right > navRect.right;

      if (isOutsideLeft || isOutsideRight) {
        const buttonCenter =
          activeButton.offsetLeft + activeButton.offsetWidth / 2;

        const navCenter = navElement.clientWidth / 2;

        navElement.scrollTo({
          left: buttonCenter - navCenter,
          behavior: "smooth",
        });
      }
    }, 100);

    return () => {
      clearTimeout(scrollTimer);
    };
  }, [location.pathname]);

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

  const getLoggedUserName = () => {
    return (
      adminUser?.name ||
      adminUser?.staffName ||
      adminUser?.email ||
      "Logged in user"
    );
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-glow admin-sidebar-glow-one" />
      <div className="admin-sidebar-glow admin-sidebar-glow-two" />

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
            <span className="admin-brand-eyebrow">
              ADMIN PORTAL
            </span>

            <h2>Japan Pattasu</h2>

            <p>{getDepartmentName()}</p>

            <span className="admin-logged-user">
              {getLoggedUserName()}
            </span>
          </div>
        </div>
      </div>

      <nav
        ref={navRef}
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
              <span className="admin-menu-icon">
                <Icon />
              </span>

              <span className="admin-menu-label">
                {menu.label}
              </span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className="admin-desktop-logout"
        onClick={handleLogout}
      >
        <span className="admin-logout-icon">
          <FiLogOut />
        </span>

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
    </aside>
  );
};

export default AdminSidebar;