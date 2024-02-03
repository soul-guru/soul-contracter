import logger from "../logger";
import axios, {AxiosInstance} from "axios";

/**
 * Create an instance of Axios with request interceptors for logging.
 * @type {axios.AxiosInstance}
 */
const instance: AxiosInstance = axios.create();

/**
 * Axios request interceptor that logs the request information before making the request.
 * @param {axios.AxiosRequestConfig} request - The Axios request configuration.
 * @returns {axios.AxiosRequestConfig} The modified Axios request configuration.
 */
instance.interceptors.request.use((request) => {
  // Extract information from the request object
  const { baseURL, url, params, method, data, headers } = request;

  // Log the request information using a logger (assuming logger.info is a function)
  logger.info(
    `call (${request.method})${request.url}?${request.params || "#"}`,
  );

  // Return the modified request object
  return request;
});

/**
 * Export the configured Axios instance with request interceptors.
 * @type {axios.AxiosInstance}
 */
export default instance;
