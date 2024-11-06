import { APIResponseProps } from './models';
import { AI21Error } from './errors';
import { Stream } from './Streaming';

export async function handleAPIResponse({ response, options }: APIResponseProps): Promise<any> {
  if (options.stream) {
    if (!response.body) {
      throw new AI21Error('Response body is null');
    }
    return new Stream(response);
  }

  const contentType = response.headers.get('content-type');
  const data = contentType?.includes('application/json') ? await response.json() : await response.text();

  return {
    data,
    response,
  };
}
