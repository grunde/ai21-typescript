import { AI21Error } from './errors.js';
import { VERSION } from './version.js';

import fetch from 'node-fetch';
import { HeadersInit } from 'node-fetch';
import {
  RequestOptions,
  FinalRequestOptions,
  APIResponseProps,
  HTTPMethod,
  PromiseOrValue,
  DefaultQuery,
} from './models';
import { AI21EnvConfig } from './EnvConfig.js';
import { handleAPIResponse } from './ResponseHandler.js';

export type Headers = Record<string, string | null | undefined>;

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

export abstract class APIClient {
  protected options: ClientOptions;
  protected baseURL: string;
  protected maxRetries: number;
  protected timeout: number;

  constructor({
    baseURL,
    maxRetries = AI21EnvConfig.MAX_RETRIES,
    timeout = AI21EnvConfig.TIMEOUT_SECONDS,
    options,
  }: {
    baseURL: string;
    maxRetries?: number | undefined;
    timeout: number | undefined;
    options: ClientOptions;
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger('maxRetries', maxRetries);
    this.timeout = validatePositiveInteger('timeout', timeout);

    this.options = options;
  }
  get<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): Promise<Rsp> {
    return this.makeRequest('get', path, opts);
  }

  post<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): Promise<Rsp> {
    return this.makeRequest('post', path, opts);
  }

  put<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): Promise<Rsp> {
    return this.makeRequest('put', path, opts);
  }

  delete<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): Promise<Rsp> {
    return this.makeRequest('delete', path, opts);
  }

  protected getUserAgent(): string {
    const platform =
      this.isRunningInBrowser() ?
        `browser/${typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'}`
      : `node/${process.version}`;
    return `AI21 Typescript SDK ${VERSION} ${platform}`;
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
    opts?: PromiseOrValue<RequestOptions<Req>>,
  ): Promise<Rsp> {
    const options = {
      method,
      path,
      ...opts,
    };

    return this.performRequest(options as FinalRequestOptions).then(handleAPIResponse);
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
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new AI21Error(`Request failed with status ${response.status}`);
    }

    return { response, options, controller };
  }

  protected isRunningInBrowser(): boolean {
    return (
      typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof fetch === 'function'
    );
  }
}
