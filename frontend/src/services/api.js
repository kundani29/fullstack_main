import axios from "axios";

const API_BASE_URL = "http://localhost:5050/api";

export const registerUser = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, payload);
  return response.data;
};
