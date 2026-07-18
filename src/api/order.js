import api from "./axios";

const getAdminHeader = () => {
  const adminToken = localStorage.getItem("adminToken");

  return {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  };
};

const getCustomerHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/* =========================
   PAYMENT APIs
========================= */

export const createPayment = (data) => {
  return api.post(
    "/orders/create-payment",
    data,
    getCustomerHeader()
  );
};

export const verifyPayment = (data) => {
  return api.post(
    "/orders/verify-payment",
    data,
    getCustomerHeader()
  );
};

export const testPayment = (data) => {
  return api.post(
    "/orders/test-payment",
    data,
    getCustomerHeader()
  );
};


export const getMyOrders = () => {
  return api.get(
    "/orders/my-orders",
    getCustomerHeader()
  );
};

export const cancelOrder = (orderId) => {
  return api.patch(
    `/orders/${orderId}/cancel`,
    {},
    getCustomerHeader()
  );
};

export const clearCancelledOrders = () => {
  return api.delete(
    "/orders/cancelled/history",
    getCustomerHeader()
  );
};



export const getAllOrders = () => {
  return api.get(
    "/orders/admin/all",
    getAdminHeader()
  );
};

export const updateAdminOrderStatus = (
  orderId,
  orderStatus
) => {
  return api.patch(
    `/orders/admin/${orderId}/status`,
    {
      orderStatus,
    },
    getAdminHeader()
  );
};

export const processOrderRefund = (orderId) => {
  return api.post(
    `/orders/admin/${orderId}/refund`,
    {},
    getAdminHeader()
  );
};