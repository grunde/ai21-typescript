import { APIResponseProps } from './types';
import { AI21Error } from './errors';
import { Stream } from './Streaming';
import { Response } from 'node-fetch';

type APIResponse<T = unknown> = {
  data: T;
  response: Response;
};

export async function handleAPIResponse<T>({
  response,
  options,
}: APIResponseProps): Promise<Stream<T> | APIResponse<T>> {
  if (options.stream) {
    if (!response.body) {
      throw new AI21Error('Response body is null');
    }
    return new Stream<T>(response);
  }

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json') ? await response.json() : await response.text();

  return {
    data,
    response,
  };
}
