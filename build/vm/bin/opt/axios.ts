export interface AxiosRequestConfig<D = any> {
  url?: string;
  method?:  | 'get' | 'GET'
    | 'delete' | 'DELETE'
    | 'head' | 'HEAD'
    | 'options' | 'OPTIONS'
    | 'post' | 'POST'
    | 'put' | 'PUT'
    | 'patch' | 'PATCH'
    | 'purge' | 'PURGE'
    | 'link' | 'LINK'
    | 'unlink' | 'UNLINK'
    | string;
  baseURL?: string;
  headers?: {[key: string]: string};
  params?: any;
  data?: D;
  timeoutErrorMessage?: string;
  withCredentials?: boolean;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxContentLength?: number;
  validateStatus?: ((status: number) => boolean) | null;
  maxBodyLength?: number;
  maxRedirects?: number;
  beforeRedirect?: (options: Record<string, any>, responseDetails: {headers: Record<string, string>}) => void;
  socketPath?: string | null;
  transport?: any;
  httpAgent?: any;
  httpsAgent?: any;
  decompress?: boolean;
  insecureHTTPParser?: boolean;
}


//@ts-ignore
let systemNetworkAsAxios = () => _SYSTEM_AXIOS.axios

export const axios: ((config: AxiosRequestConfig) => any) = systemNetworkAsAxios()
