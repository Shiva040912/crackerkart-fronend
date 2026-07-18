import api from "./axios";

const getCustomerHeader = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const addToCart = (data) => {
  return api.post("/cart", data, getCustomerHeader());
};

export const getMyCart = () => {
  return api.get("/cart", getCustomerHeader());
};

export const updateCartItem = (cartId, data) => {
  return api.patch(`/cart/${cartId}`, data, getCustomerHeader());
};

export const removeCartItem = (cartId) => {
  return api.delete(`/cart/${cartId}`, getCustomerHeader());
};

export const clearCart = () => {
  return api.delete("/cart", getCustomerHeader());
};