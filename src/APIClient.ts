import { AI21Error } from './errors';
import { VERSION } from './version';

import {
  RequestOptions,
  FinalRequestOptions,
  APIResponseProps,
  HTTPMethod,
  Headers,
  CrossPlatformResponse,
} from './types';
import { AI21EnvConfig } from './EnvConfig';
import { createFetchInstance } from './runtime';
import { Fetch } from 'fetch';
import { createReadStream } from 'fs';
import { basename as getBasename } from 'path';
import FormData from 'form-data';

const validatePositiveInteger = (name: string, n: unknown): number => {
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new AI21Error(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new AI21Error(`${name} must be a positive integer`);
  }
  return n;
};

export abstract class APIClient {
  protected baseURL: string;
  protected maxRetries: number;
  protected timeout: number;
  protected fetch: Fetch;

  constructor({
    baseURL,
    maxRetries = AI21EnvConfig.MAX_RETRIES,
    timeout = AI21EnvConfig.TIMEOUT_SECONDS,
    fetch = createFetchInstance(),
  }: {
    baseURL: string;
    maxRetries?: number | undefined;
    timeout: number | undefined;
    fetch?: Fetch;
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger('maxRetries', maxRetries);
    this.timeout = validatePositiveInteger('timeout', timeout);
    this.fetch = fetch;
  }
  get<Req, Rsp>(path: string, opts?: RequestOptions<Req>): Promise<Rsp> {
    return this.makeRequest('get', path, opts);
  }

  post<Req, Rsp>(path: string, opts?: RequestOptions<Req>): Promise<Rsp> {
    return this.makeRequest('post', path, opts);
  }

  put<Req, Rsp>(path: string, opts?: RequestOptions<Req>): Promise<Rsp> {
    return this.makeRequest('put', path, opts);
  }

  delete<Req, Rsp>(path: string, opts?: RequestOptions<Req>): Promise<Rsp> {
    return this.makeRequest('delete', path, opts);
  }

  upload<Req, Rsp>(path: string, filePath: string, opts?: RequestOptions<Req>): Promise<Rsp> {
    const formDataRequest = this.makeFormDataRequest(path, filePath, opts);
    return this.performRequest(formDataRequest).then(
      (response) => this.fetch.handleResponse<Rsp>(response) as Rsp,
    );
  }

  protected makeFormDataRequest<Req>(
    path: string,
    filePath: string,
    opts?: RequestOptions<Req>,
  ): FinalRequestOptions {
    const formData = new FormData();
    const fileStream = createReadStream(filePath);
    const fileName = getBasename(filePath);

    formData.append('file', fileStream, fileName);

    if (opts?.body) {
      const body = opts.body as Record<string, string>;
      for (const [key, value] of Object.entries(body)) {
        if (Array.isArray(value)) {
          value.forEach((item) => formData.append(key, item));
        } else {
          formData.append(key, value);
        }
      }
    }

    const headers = {
      ...opts?.headers,
      'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
    };
    console.log(headers);
    console.log('-------------------------');
    console.log(formData.getHeaders());
    console.log('-------------------------');

    const options: FinalRequestOptions = {
      method: 'post',
      path: path,
      body: formData,
      headers,
    };
    return options;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected authHeaders(opts: FinalRequestOptions): Headers {
    return {};
  }

  private makeRequest<Req, Rsp>(method: HTTPMethod, path: string, opts?: RequestOptions<Req>): Promise<Rsp> {
    const options = {
      method,
      path,
      ...opts,
    };

    return this.performRequest(options as FinalRequestOptions).then(
      (response) => this.fetch.handleResponse<Rsp>(response) as Rsp,
    );
  }

  private async performRequest(options: FinalRequestOptions): Promise<APIResponseProps> {
    let url = `${this.baseURL}${options.path}`;

    if (options.query) {
      const queryString = new URLSearchParams(options.query as Record<string, string>).toString();
      url += `?${queryString}`;
    }

    const headers = {
      ...this.defaultHeaders(options),
      ...options.headers,
    };

    const response = await this.fetch.call(url, { ...options, headers });

    if (!response.ok) {
      throw new AI21Error(`Request failed with status ${response.status}. ${await response.text()}`);
    }

    return { response: response as CrossPlatformResponse, options };
  }

  protected isRunningInBrowser(): boolean {
    return (
      typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof fetch === 'function'
    );
  }
}
