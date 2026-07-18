import api from "./axios";

export const sendChatMessage = async (message) => {
  const response = await api.post("/chatbot/message", {
    message,
  });

  return response.data;
};