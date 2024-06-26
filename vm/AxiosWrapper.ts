import axios from "axios";
import util from "util";
import logger from "../src/logger";
import {CliColor} from "../src/classes/cli-color";
import {requireMongoDB} from "../src/mongo";
import {selectVmOrNull} from "../src/vm-driver";
import {assert} from "../src/classes/assert";

assert(() => process.env.I2_CLUSTER_FLOW)

const appConfig = require("../app.json");

export const axiosClient = axios.create({

})

// Add a response interceptor
axiosClient.interceptors.response.use(function (response) {
  const params = util.inspect(response.config.params, { showHidden: false, depth: null, colors: true })
  const body = util.inspect(response.data, { showHidden: false, depth: null, colors: true })

  if (typeof response.config['vmid'] != "string") {
    logger.error(`$\{CliColor.BgMagenta}[axios]$\{CliColor.Reset} An attempt to send a request without authorization and association with a specific container is prevented`)
    return null
  }

  const bytes = (new TextEncoder().encode(response.data)).length

  if (selectVmOrNull(response.config['vmid'])?.botId) {
    requireMongoDB()
      ?.getContracts()
      ?.updateIncomingTrafficUsage(
        selectVmOrNull(response.config['vmid']).botId,
        bytes
      )
      ?.then()
      ?.catch()
  } else {
    logger.warn(`Unaccounted traffic of ${bytes} bytes goes straight down the drain`)
  }

  logger.info(`${CliColor.BgMagenta}[axios]${CliColor.Reset} -> (${response.config.method.toLocaleUpperCase()}) ${response.config.url} ${params} ${body}`, {
    vm: null
  })

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

  if (typeof config['vmid'] != "string") {
    logger.error(`$\{CliColor.BgMagenta}[axios]$\{CliColor.Reset} An attempt to send a request without authorization and association with a specific container is prevented`)
    return null
  }

  logger.info(`${CliColor.BgMagenta}[axios]${CliColor.Reset} -> (${config.method.toLocaleUpperCase()}) ${config.url} ${params} ${body}`, {
    vm: config['vmid']
  })

  const bytes = (new TextEncoder().encode(config.data)).length

  if (selectVmOrNull(config['vmid'])?.botId) {
    requireMongoDB()
      ?.getContracts()
      ?.updateIncomingTrafficUsage(
        selectVmOrNull(config['vmid']).botId,
        bytes
      )
      ?.then()
      ?.catch()
  } else {
    logger.warn(`Unaccounted traffic of ${bytes} bytes goes straight down the drain`)
  }

  for (const host of appConfig.firewall.deny) {
    if (config.url.indexOf(host) > -1) {
      return {
        ...config,
        url: "/",
        baseURL: "/"
      }
    }
  }

  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});


export default class AxiosWrapper {
  static methods = [this.request];

  static request(argv) {
    const {vmid, args} = argv

    return new Promise(async (resolve, reject) => {
      axiosClient.apply(null, [{...args, vmid}]).then(function (result: any) {
        resolve(JSON.stringify({
          data: result.data,
          config: result.config,
          tip: "Please note this is a stripped-down build for Core-VM, so online response and request data may not be complete"
        }))
      }).catch(function (error: any) {
        reject(JSON.stringify({
          message: error.message,
          config: error.config,
          name: error.name,
          tip: "Please note this is a stripped-down build for Core-VM, so online response and request data may not be complete",
          helpers:{
            errorMessage: error?.response?.data ? error.response.data : null
          }
        }))
      })
    });
  }
}

export const axiosDeterminateRouter = {
  resolveDialog: ({ dialogId, text }) => {
    axios
      .post(
        process.env.I2_CLUSTER_FLOW +
        "/service/dialogs/resolve/" +
        dialogId,
        {
          markup: [{ plainText: text }],
        },
      )
      .catch(console.error);
  },

  resolveDialogWithGif: ({ dialogId, src, gifDescription = "" }) => {
    axios
      .post(
        process.env.I2_CLUSTER_FLOW +
        "/service/dialogs/resolve/" +
        dialogId,
        {
          markup: [{ gifDescription, gifHref: src }],
        },
      )
      .catch(console.error);
  },
}
