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
      let colorize: (any: any, opt: object) => any

      try {
        colorize = require('json-colorizer')
      } catch (e) {
        colorize = function (any, opt) {
          return util.inspect(any, { showHidden: false, depth: null, colors: true })
        }
      }

      console.log(arg.map(i => {
        return colorize(i, { pretty: false })
      }).join(" "), colorize({vm: vm.ID}, {}))
    }
  }

  const lodash = {}

  _.toPairs(_).map(k => {
    if (typeof k[1] == 'function') {
      lodash[k[0]] = k[1]
    }
  })


  return {
    ...base,
    ...lodash,
  }
}


export default function getBootableISO(vm: VM): IBootableIso {
  // const vmEmitter = new VMEmitter();

  return {
    // vmEmitter,
    env: fillEnv(vm)
  };
}
