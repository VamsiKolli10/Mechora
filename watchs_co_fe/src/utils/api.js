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

let refreshRequest = null;
let readSessionIdentity = () => null;
export const setSessionIdentityReader = (reader) => { readSessionIdentity = reader; };

api.interceptors.request.use((request) => {
  if (request._sessionIdentity === undefined) request._sessionIdentity = readSessionIdentity();
  return request;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isAuthRequest = originalRequest?.url?.startsWith("/api/auth/");

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }
    if (originalRequest._sessionIdentity !== readSessionIdentity()) return Promise.reject(error);

    originalRequest._retry = true;
    refreshRequest ||= axios
      .post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true })
      .finally(() => {
        refreshRequest = null;
      });

    try {
      await refreshRequest;
      if (originalRequest._sessionIdentity !== readSessionIdentity()) return Promise.reject(error);
      return api(originalRequest);
    } catch {
      if (originalRequest._sessionIdentity === readSessionIdentity() && !originalRequest.skipSessionExpiredNotification && typeof window !== "undefined") {
        window.dispatchEvent(new Event("mechora:session-expired"));
      }
      return Promise.reject(error);
    }
  }
);

export default api;
