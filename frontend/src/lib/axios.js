import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "https://new-peer-1.onrender.com/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});