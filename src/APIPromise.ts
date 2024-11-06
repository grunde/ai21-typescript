import { APIResponseProps } from "./models";
import { AI21Error } from "./Errors";
import { Stream } from "./Streaming";
import { Response } from "node-fetch";

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