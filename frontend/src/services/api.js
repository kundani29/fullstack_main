import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const registerUser = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
  return response.data;
};
