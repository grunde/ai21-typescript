import { BlobLike } from "formdata-node";
import { Readable } from "stream";
import { Response } from "node-fetch";
export type Headers = Record<string, string | null | undefined>;
type HTTPMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type APIResponseProps = {
    response: Response;
    options: FinalRequestOptions;
    controller: AbortController;
};
export type RequestOptions<Req = unknown | Record<string, unknown> | Readable | BlobLike | ArrayBufferView | ArrayBuffer> = {
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
export declare const createResponseHeaders: (headers: Awaited<ReturnType<any>>["headers"]) => Record<string, string>;
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
export declare class APIPromise<T> extends Promise<T> {
    private responsePromise;
    private parseResponse;
    constructor(responsePromise: Promise<APIResponseProps>, parseResponse?: (props: APIResponseProps) => Promise<T>);
    /**
     * Gets the raw Response instance
     */
    asResponse(): Promise<Response>;
    /**
     * Gets both the parsed response data and the raw Response instance
     */
    withResponse(): Promise<{
        data: T;
        response: Response;
    }>;
    private parse;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): Promise<T | TResult>;
    finally(onfinally?: (() => void) | null): Promise<T>;
}
export declare abstract class APIClient {
    protected options: ClientOptions;
    protected apiKey: string;
    protected baseURL: string;
    protected maxRetries: number;
    protected timeout: number;
    constructor({ baseURL, maxRetries, timeout, // 10 minutes
    apiKey, options, }: {
        baseURL: string;
        maxRetries?: number | undefined;
        timeout: number | undefined;
        apiKey: string;
        options: ClientOptions;
    });
    protected get<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp>;
    protected post<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp>;
    protected patch<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp>;
    protected put<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp>;
    protected delete<Req, Rsp>(path: string, opts?: PromiseOrValue<RequestOptions<Req>>): APIPromise<Rsp>;
    private getUserAgent;
    protected defaultHeaders(opts: FinalRequestOptions): Headers;
    protected authHeaders(opts: FinalRequestOptions): Headers;
    protected defaultQuery(): DefaultQuery | undefined;
    protected stringifyQuery(query: Record<string, unknown>): string;
    private makeRequest;
    private performRequest;
    protected static isRunningInBrowser(): boolean;
}
export declare const readEnv: (env: string) => string | undefined;
export {};
