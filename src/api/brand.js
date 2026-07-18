import api from "./axios";

export const getBrands = () => {
  return api.get("/products/brands");
};