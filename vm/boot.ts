import {IBootableIso} from "../src/interfaces/IBootableIso";

import fetch from "sync-fetch";
import VM from "./vm";
import logger from "../src/logger";
import util from "util";
import _ from "lodash";
import {axiosClient} from "./AxiosWrapper";
import { broadcast } from "../src/socket";


export function fillEnv(vm: VM) {
  const base = {
    /**
     *  Send a message to the logger
     * @param arg 
     */
    log: (arg) => {
      logger.info(
        util.inspect(arg, { showHidden: false, depth: null, colors: true }),
        {vm: vm.ID}
      )
    },

    /**
     *  Send a message to the websocket
     * @param arg 
     */
    websocketSend: (arg) => {
      logger.info(
        "send message to ws: " + util.inspect(arg, { showHidden: false, depth: null, colors: true }),
        {vm: vm.ID}
      )

      broadcast(arg)
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
