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

  const adminUser = JSON.parse(
    localStorage.getItem("adminUser")
  );

  const department =
    adminUser?.department;

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    toast.success("Logged out");

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <h2>Japan Pattasu</h2>
        <p>{department}</p>
      </div>

      <nav className="admin-nav">
        {(menus[department] || []).map(
          (menu) => {
            const Icon = menu.icon;

            return (
              <button
                key={menu.path}
                className={
                  location.pathname ===
                  menu.path
                    ? "active"
                    : ""
                }
                onClick={() =>
                  navigate(menu.path)
                }
              >
                <Icon />
                {menu.label}
              </button>
            );
          }
        )}
      </nav>

      <button
        className="admin-logout-btn"
        onClick={handleLogout}
      >
        <FiLogOut />
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;