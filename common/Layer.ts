import logger from "../src/logger";

export default class Layer<data> {
  public async signal(out: data) {}

  public invoke(out: data) {
    return this.signal(out)
  }
}
