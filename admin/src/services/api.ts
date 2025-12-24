import axios, { type AxiosRequestConfig } from "axios";

import Logger from "../utils/logger";
import { validateAndLogConfig } from "../utils/configValidator";

type RequestMetadata = {
  startTime: number;
};

type RequestConfigWithMeta<TConfig extends AxiosRequestConfig = AxiosRequestConfig> =
  TConfig & {
    metadata?: RequestMetadata;
  };

// Read API URL from environment variable (Vite)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Validate configuration at startup
validateAndLogConfig({ API_URL });

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const configWithMeta = config as RequestConfigWithMeta<typeof config>;
    configWithMeta.metadata = { startTime: performance.now() };

    if (import.meta.env.DEV) {
      Logger.debug("[API Request]", {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
      });
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return configWithMeta;
  },
  (error) => {
    Logger.error("API Request Error", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => {
    const configWithMeta = response.config as RequestConfigWithMeta<
      typeof response.config
    >;
    const duration =
      configWithMeta.metadata?.startTime !== undefined
        ? performance.now() - configWithMeta.metadata.startTime
        : null;

    if (import.meta.env.DEV) {
      Logger.debug("[API Response]", {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        durationMs:
          duration !== null && !Number.isNaN(duration)
            ? Math.round(duration)
            : undefined,
      });
    }
    return response;
  },
  (error) => {
    const configWithMeta = (error.config || {}) as RequestConfigWithMeta<
      typeof error.config
    >;
    const duration =
      configWithMeta.metadata?.startTime !== undefined
        ? performance.now() - configWithMeta.metadata.startTime
        : null;

    if (import.meta.env.DEV) {
      Logger.error("API Response Error", {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        durationMs:
          duration !== null && !Number.isNaN(duration)
            ? Math.round(duration)
            : undefined,
      });
    }

    const requestUrl = error.config?.url || "";
    const isAuthLogin = requestUrl.includes("/auth/login");

    if (error.response?.status === 401 && !isAuthLogin) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else {
      Logger.error(
        `API Error: ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`,
        error.response?.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

export default api;
