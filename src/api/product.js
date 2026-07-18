import api from "./axios";

const getAdminHeader = () => {
  const token = localStorage.getItem("adminToken");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProducts = () => {
  return api.get("/products");
};

export const getActiveProducts = () => {
  return api.get("/products/active");
};

export const createProduct = (data) => {
  return api.post("/products", data, getAdminHeader());
};

export const updateProduct = (id, data) => {
  return api.patch(`/products/${id}`, data, getAdminHeader());
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`, getAdminHeader());
};

