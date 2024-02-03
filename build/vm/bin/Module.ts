// @ts-ignore
import {Call} from "./Call";

class Module {}

export class TypedModule extends Module {
  protected _configs: object

  protected getConfig<V = string>(name: string|null = null): V|object {
    if (typeof name != "string" ) {
      return this._configs as object
    } else {
      return this._configs[name] as V
    }
  }

  constructor(configs: object) {
    super();
    this._configs = configs
  }

  public async create(value: object): Promise<Call | null> {
    return null
  }
}