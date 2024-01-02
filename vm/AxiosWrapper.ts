import axios from "axios";
import util from "util";
import logger from "../src/logger";
import {CliColor} from "../src/cli-color";

export const axiosClient = axios.create({

})

// Add a response interceptor
axiosClient.interceptors.response.use(function (response) {
  const params = util.inspect(response.config.params, { showHidden: false, depth: null, colors: true })
  const body = util.inspect(response.data, { showHidden: false, depth: null, colors: true })

  logger.info(`${CliColor.BgMagenta}[axios]${CliColor.Reset} -> (${response.config.method.toLocaleUpperCase()}) ${response.config.url} ${params} ${body}`)

  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error);
});

// Add a request interceptor
axiosClient.interceptors.request.use(function (config) {
  const params = util.inspect(config.params, { showHidden: false, depth: null, colors: true })
  const body = util.inspect(config.data, { showHidden: false, depth: null, colors: true })

  logger.info(`${CliColor.BgMagenta}[axios]${CliColor.Reset} -> (${config.method.toLocaleUpperCase()}) ${config.url} ${params} ${body}`)
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});


export default class AxiosWrapper {
  static methods = [this.get];

  static async get(...args) {
    return axios.get.apply(this, args);
  }
}