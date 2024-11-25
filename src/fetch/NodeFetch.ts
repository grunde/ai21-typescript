import { FinalRequestOptions, CrossPlatformResponse } from 'types';
import { BaseFetch } from './BaseFetch';
import { Stream, NodeSSEDecoder } from '../streaming';
import FormData from 'form-data';

export class NodeFetch extends BaseFetch {
  async call(url: string, options: FinalRequestOptions): Promise<CrossPlatformResponse> {
    const nodeFetchModule = await import('node-fetch');
    const nodeFetch = nodeFetchModule.default;

    const body = options.body instanceof FormData ? options.body : JSON.stringify(options.body);

    return nodeFetch(url, {
      method: options.method,
      headers: options?.headers ? (options.headers as Record<string, string>) : undefined,
      body,
    });
  }

  handleStream<T>(response: CrossPlatformResponse): Stream<T> {
    type NodeRespose = import('node-fetch').Response;
    return new Stream<T>(response as NodeRespose, new NodeSSEDecoder());
  }
}
