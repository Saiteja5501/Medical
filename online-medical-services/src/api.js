// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

// Add token automatically if present in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default API;
