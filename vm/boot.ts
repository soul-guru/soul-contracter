import {IBootableIso} from "../src/interfaces/IBootableIso";

import fetch from "sync-fetch";
import VM from "./vm";
import logger from "../src/logger";
import util from "util";
import _ from "lodash";
import {axiosClient} from "./AxiosWrapper";


export function fillEnv(vm: VM) {
  const base = {
    log: (...arg) => {
      logger.info(arg.map(i => {
        return util.inspect(i, { showHidden: false, depth: null, colors: true })
      }).join(" "), {vm: vm.ID})
    },
    network_request_json: (url: string, params: object) => {
      return Object(fetch(url, params).json());
    },
    network_request_raw: (url: string, params: object) => {
      return String(fetch(url, params).text());
    },
  }

  const lodash = {}
  const axios_ = {}

  _.toPairs(_).map(k => {
    if (typeof k[1] == 'function') {
      lodash[k[0]] = k[1]
    }
  })

  _.toPairs(axiosClient).map(k => {
    if (typeof k[1] == 'function') {
      axios_["axios_" + k[0]] = k[1]
    }
  })

  return {
    ...base,
    ...lodash,
    ...axios_
  }
}


export default function getBootableISO(vm: VM): IBootableIso {
  // const vmEmitter = new VMEmitter();

  return {
    // vmEmitter,
    env: fillEnv(vm)
  };
}
