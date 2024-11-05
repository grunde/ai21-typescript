import { AI21Error } from "./errors.js";
import { VERSION } from "./version.js";
import fetch from 'node-fetch';
export const createResponseHeaders = (headers) => {
    return new Proxy(Object.fromEntries(
    // @ts-ignore
    headers.entries()), {
        get(target, name) {
            const key = name.toString();
            return target[key.toLowerCase()] || target[key];
        },
    });
};
const validatePositiveInteger = (name, n) => {
    if (typeof n !== 'number' || !Number.isInteger(n)) {
        throw new AI21Error(`${name} must be an integer`);
    }
    if (n < 0) {
        throw new AI21Error(`${name} must be a positive integer`);
    }
    return n;
};
async function defaultParseResponse({ response }) {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
export class APIPromise extends Promise {
    constructor(responsePromise, parseResponse = defaultParseResponse) {
        super((resolve) => resolve(null));
        this.responsePromise = responsePromise;
        this.parseResponse = parseResponse;
    }
    /**
     * Gets the raw Response instance
     */
    asResponse() {
        return this.responsePromise.then((p) => p.response);
    }
    /**
     * Gets both the parsed response data and the raw Response instance
     */
    async withResponse() {
        const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
        return { data, response };
    }
    parse() {
        return this.responsePromise.then(this.parseResponse);
    }
    then(onfulfilled, onrejected) {
        return this.parse().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.parse().catch(onrejected);
    }
    finally(onfinally) {
        return this.parse().finally(onfinally);
    }
}
export class APIClient {
    constructor({ baseURL, maxRetries = 2, timeout = 600000, // 10 minutes
    // fetch: overridenFetch,
    apiKey, options, }) {
        this.baseURL = baseURL;
        this.maxRetries = validatePositiveInteger('maxRetries', maxRetries);
        this.timeout = validatePositiveInteger('timeout', timeout);
        this.apiKey = apiKey;
        this.options = options;
    }
    get(path, opts) {
        return this.makeRequest('get', path, opts);
    }
    post(path, opts) {
        return this.makeRequest('post', path, opts);
    }
    patch(path, opts) {
        return this.makeRequest('patch', path, opts);
    }
    put(path, opts) {
        return this.makeRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.makeRequest('delete', path, opts);
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${VERSION}`;
    }
    defaultHeaders(opts) {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': this.getUserAgent(),
            //   ...getPlatformHeaders(),
            ...this.authHeaders(opts),
        };
    }
    authHeaders(opts) {
        return {};
    }
    defaultQuery() {
        return this.options.defaultQuery;
    }
    stringifyQuery(query) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        }
        return params.toString();
    }
    makeRequest(method, path, opts) {
        const options = {
            method,
            path,
            ...opts
        };
        return new APIPromise(this.performRequest(options));
    }
    async performRequest(options) {
        const controller = new AbortController();
        const url = `${this.baseURL}${options.path}`;
        const headers = {
            ...this.defaultHeaders(options),
            ...options.headers,
        };
        const response = await fetch(url, {
            method: options.method,
            headers: headers,
            signal: controller.signal, // Type cast to avoid AbortSignal compatibility issue
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        if (!response.ok) {
            throw new AI21Error(`Request failed with status ${response.status}`);
        }
        return { response, options, controller };
    }
    static isRunningInBrowser() {
        return (typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof fetch === 'function');
    }
}
export const readEnv = (env) => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[env]?.trim() ?? undefined;
    }
    return undefined;
};
