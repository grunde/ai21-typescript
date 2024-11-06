import { BlobLike } from "formdata-node";
import { Response } from "node-fetch";
import { Readable } from "stream";

export type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type APIResponseProps = {
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

export type DefaultQuery = Record<string, unknown>;
export type PromiseOrValue<T> = T | Promise<T>;
