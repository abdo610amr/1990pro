import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
