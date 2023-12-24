import EventEmitter from "node:events";

class VMEmitter extends EventEmitter {}

export default function getBootableISO() {
  const vmEmitter = new VMEmitter();

  return {
    vmEmitter,
  };
}
