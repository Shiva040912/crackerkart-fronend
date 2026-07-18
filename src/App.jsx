import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";

import Register from "./pages/customer/Register";
import Login from "./pages/customer/Login";
import Home from "./pages/customer/Home";
import Products from "./pages/customer/Product";
import Category from "./pages/customer/Category";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";
import Brands from "./pages/customer/Brand";
import Wishlist from "./pages/customer/Wishlist";
import QuickBuy from "./pages/customer/QuickBuy";
import Chatbot from "./components/Chatbot";

import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import Product from "./pages/admin/Product";
import Customers from "./pages/admin/Customer";
import Stock from "./pages/admin/Stock";
import Orders from "./pages/admin/Orders";
import Employees from "./pages/admin/Employees";

import AdminProtectedRoute from "./route/AdminProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    
    <BrowserRouter>
      <ThemeProvider>
        <ScrollToTop />

        <Routes>
          {/* Customer */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/quick-buy" element={<QuickBuy />} />
          <Route path="/orders" element={<MyOrders />} />
         

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <Dashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <AdminProtectedRoute>
                <Categories />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminProtectedRoute>
                <Product />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/customers"
            element={
              <AdminProtectedRoute>
                <Customers />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/stock"
            element={
              <AdminProtectedRoute>
                <Stock />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminProtectedRoute>
                <Orders />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <AdminProtectedRoute>
                <Employees />
              </AdminProtectedRoute>
            }
          />
        </Routes>
       <Chatbot />
        
      </ThemeProvider>
    </BrowserRouter>
    
  );
}

export default App;
