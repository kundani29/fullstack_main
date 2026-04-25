import axios from "axios";

const rawBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5050" : "");
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL in frontend deployment environment.");
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (payload) => {
  assertApiBaseUrl();
  const response = await api.post("/api/auth/register", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  assertApiBaseUrl();
  const response = await api.post("/api/auth/login", payload);
  return response.data;
};

export const fetchNotes = async (params = {}) => {
  assertApiBaseUrl();
  const response = await api.get("/api/notes", { params });
  return response.data;
};

export const fetchNoteById = async (id) => {
  assertApiBaseUrl();
  const response = await api.get(`/api/notes/${id}`);
  return response.data;
};

export const uploadNote = async (formData) => {
  assertApiBaseUrl();
  const response = await api.post("/api/notes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const likeNote = async (id) => {
  assertApiBaseUrl();
  const response = await api.post(`/api/notes/${id}/like`);
  return response.data;
};

export const saveNote = async (id) => {
  assertApiBaseUrl();
  const response = await api.post(`/api/notes/${id}/save`);
  return response.data;
};

export const addComment = async (id, commentText) => {
  assertApiBaseUrl();
  const response = await api.post(`/api/notes/${id}/comment`, { commentText });
  return response.data;
};

export const fetchComments = async (id) => {
  assertApiBaseUrl();
  const response = await api.get(`/api/notes/${id}/comments`);
  return response.data;
};

export const fetchMyProfile = async () => {
  assertApiBaseUrl();
  const response = await api.get("/api/user/me");
  return response.data;
};

export const fetchMyUploads = async () => {
  assertApiBaseUrl();
  const response = await api.get("/api/user/uploads");
  return response.data;
};

export const fetchMySavedNotes = async () => {
  assertApiBaseUrl();
  const response = await api.get("/api/user/saved");
  return response.data;
};

export const fetchUsers = async () => {
  assertApiBaseUrl();
  const response = await api.get("/api/users");
  return response.data;
};

export const deleteNoteById = async (id) => {
  assertApiBaseUrl();
  const response = await api.delete(`/api/notes/${id}`);
  return response.data;
};
