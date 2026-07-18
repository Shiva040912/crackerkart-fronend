import api from "./axios";

export const getWishlist = () => {
  return api.get("/wishlist");
};

export const addToWishlist = (productId) => {
  return api.post("/wishlist", {
    productId,
  });
};

export const removeFromWishlist = (productId) => {
  return api.delete(`/wishlist/${productId}`);
};