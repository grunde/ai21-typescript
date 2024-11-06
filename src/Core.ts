import { AI21Error } from "./errors.js";
import { VERSION } from "./version.js";
import { BlobLike } from "formdata-node";
import { Readable } from "stream";
import fetch from 'node-fetch';
import { HeadersInit } from "node-fetch";
import { Response } from "node-fetch";
import { Stream } from "./Streaming";

// export type Fetch = (url: RequestInfo, init?: RequestInit) => Promise<Response>;
export type Headers = Record<string, string | null | undefined>;

type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
// export type RequestClient = { fetch: Fetch };


type APIResponseProps = {
    response: Response;
    options: FinalRequestOptions;
    controller: AbortController;
  };

  export type RequestOptions<
  Req = unknown | Record<string, unknown> | Readable | BlobLike | ArrayBufferView | ArrayBuffer,
> = {
    method?: HTTPMethod;
    path?: string;
    query?: Req | undefined;
    body?: Req | null | undefined;
    headers?: Headers | undefined;
  
    maxRetries?: number;
    stream?: boolean | undefined;
    timeout?: number;
  };
export type FinalRequestOptions = RequestOptions & {
  method: HTTPMethod;
  path: string;
};
export const createResponseHeaders = (
    headers: Awaited<ReturnType<any>>['headers'],
  ): Record<string, string> => {
    return new Proxy(
      Object.fromEntries(
        // @ts-ignore
        headers.entries(),
      ),
      {
        get(target, name) {
          const key = name.toString();
          return target[key.toLowerCase()] || target[key];
        },
      },
    );
  };

  const validatePositiveInteger = (name: string, n: unknown): number => {
    if (typeof n !== 'number' || !Number.isInteger(n)) {
      throw new AI21Error(`${name} must be an integer`);
    }
    if (n < 0) {
      throw new AI21Error(`${name} must be a positive integer`);
    }
    return n;
  };

type ClientOptions = {
    apiKey?: string;
    organization?: string | null;
    project?: string | null;
    baseURL?: string;
    maxRetries?: number;
    timeout?: number;
    defaultQuery?: DefaultQuery;
    defaultHeaders?: Headers;
    dangerouslyAllowBrowser?: boolean;
};

type DefaultQuery = Record<string, unknown>;
type PromiseOrValue<T> = T | Promise<T>;

async function defaultParseResponse({ response, options }: APIResponseProps): Promise<any> {
    if (options.stream) {
        if (!response.body) {
            throw new AI21Error('Response body is null');
        }
        return new Stream(response as any);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

export class APIPromise<T> extends Promise<T> {
    constructor(
      private responsePromise: Promise<APIResponseProps>,
      private parseResponse: (props: APIResponseProps) => Promise<T> = defaultParseResponse,
    ) {
      super((resolve) => resolve(null as any));
    }
  
    /**
     * Gets the raw Response instance
     */
    asResponse(): Promise<Response> {
      return this.responsePromise.then((p) => p.response);
    }
  
    /**
     * Gets both the parsed response data and the raw Response instance
     */
    async withResponse(): Promise<{ data: T; response: Response }> {
      const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
      return { data, response };
    }
  
    private parse(): Promise<T> {
      return this.responsePromise.then(this.parseResponse);
    }
  
    override then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
    ): Promise<TResult1 | TResult2> {
      return this.parse().then(onfulfilled, onrejected);
    }
  
    override catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
    ): Promise<T | TResult> {
      return this.parse().catch(onrejected);
    }
  
    override finally(onfinally?: (() => void) | null): Promise<T> {
      return this.parse().finally(onfinally);
    }
  }


export abstract class APIClient {
    protected options: ClientOptions;
    protected baseURL: string;
    protected maxRetries: number;
    protected timeout: number;

    constructor({
        baseURL,
        maxRetries = 3,
        timeout = 300000,
        apiKey,
        options,
      }: {
        baseURL: string;
        maxRetries?: number | undefined;
        timeout: number | undefined;
        apiKey: string;
        options: ClientOptions;
      }) {
        this.baseURL = baseURL;
        this.maxRetries = validatePositiveInteger('maxRetries', maxRetries);
        this.timeout = validatePositiveInteger('timeout', timeout);
    
        this.options = options;
      }
    get<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp> {
        return this.makeRequest('get', path, opts);
    }

    post<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp> {
        return this.makeRequest('post', path, opts);
    }

    put<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp> {
        return this.makeRequest('put', path, opts);
    }

    delete<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp> {
        return this.makeRequest('delete', path, opts);
    }

    protected getUserAgent(): string {
        return`AI21 Typescript SDK ${VERSION}`;
      }

      protected defaultHeaders(opts: FinalRequestOptions): Headers {
        return {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': this.getUserAgent(),
          ...this.authHeaders(opts),
        };
      }

      protected authHeaders(opts: FinalRequestOptions): Headers {
        return {};
      }

      protected defaultQuery(): DefaultQuery | undefined {
        return this.options.defaultQuery;
      }

      protected stringifyQuery(query: Record<string, unknown>): string {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        }
        return params.toString();
      }

      private makeRequest<Req, Rsp>(
          method: HTTPMethod,
          path: string,
          opts?: PromiseOrValue<RequestOptions<Req>>
      ): APIPromise<Rsp> {
          const options = {
              method,
              path,
              ...opts
          };
          
          return new APIPromise(this.performRequest(options as FinalRequestOptions));
      }

      private async performRequest(options: FinalRequestOptions): Promise<APIResponseProps> {
          const controller = new AbortController();
          const url = `${this.baseURL}${options.path}`;
          
          const headers = {
              ...this.defaultHeaders(options),
              ...options.headers,
          };

          const response = await fetch(url, {
              method: options.method,
              headers: headers as HeadersInit,
              signal: controller.signal as any, // Type cast to avoid AbortSignal compatibility issue
              body: options.body ? JSON.stringify(options.body) : undefined
          });

          if (!response.ok) {
              throw new AI21Error(`Request failed with status ${response.status}`);
          }

          return { response, options, controller };
      }

    protected static isRunningInBrowser(): boolean {
        return (
          typeof window !== 'undefined' &&
          typeof window.document !== 'undefined' &&
          typeof fetch === 'function'
        );
      }
}
  