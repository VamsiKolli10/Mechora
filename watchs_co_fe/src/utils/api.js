import axios from "axios";
import { API_BASE_URL } from "@/constants/env";

// Axios client configured to send HttpOnly cookies for auth + guest tokens.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default api;
