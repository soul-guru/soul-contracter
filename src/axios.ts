import axios from "axios";
import logger from "./logger";

// Create an instance of Axios
const instance = axios.create();

// Add a request interceptor
instance.interceptors.request.use((request) => {
  // Extract information from the request object
  const { baseURL, url, params, method, data, headers } = request;

  // Log the request information using a logger (assuming logger.info is a function)
  logger.info(
      `call (${request.method})${request.url}?${request.params || "#"} `,
  );

  // Return the modified request object
  return request;
});

// Export the configured Axios instance
export default instance;
