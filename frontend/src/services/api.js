import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5050" : "");
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL in frontend deployment environment.");
  }
};

export const registerUser = async (payload) => {
  assertApiBaseUrl();
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
  return response.data;
};

export const loginUser = async (payload) => {
  assertApiBaseUrl();
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, payload);
  return response.data;
};
