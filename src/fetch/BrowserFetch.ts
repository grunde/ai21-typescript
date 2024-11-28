import { FinalRequestOptions, CrossPlatformResponse } from 'types';
import { BaseFetch } from './BaseFetch';
import { Stream, BrowserSSEDecoder } from '../streaming';

export class BrowserFetch extends BaseFetch {
  call(url: string, options: FinalRequestOptions): Promise<CrossPlatformResponse> {
    const controller = new AbortController();
    const body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);

    return fetch(url, {
      method: options.method,
      headers: options?.headers ? (options.headers as HeadersInit) : undefined,
      body,
      signal: controller.signal,
    });
  }

  handleStream<T>(response: CrossPlatformResponse): Stream<T> {
    return new Stream<T>(response as Response, new BrowserSSEDecoder());
  }
}
