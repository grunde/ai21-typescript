"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readEnv = exports.APIClient = exports.APIPromise = exports.createResponseHeaders = void 0;
const errors_js_1 = require("./errors.js");
const version_js_1 = require("./version.js");
const node_fetch_1 = __importDefault(require("node-fetch"));
const Streaming_1 = require("./Streaming");
const createResponseHeaders = (headers) => {
    return new Proxy(Object.fromEntries(
    // @ts-ignore
    headers.entries()), {
        get(target, name) {
            const key = name.toString();
            return target[key.toLowerCase()] || target[key];
        },
    });
};
exports.createResponseHeaders = createResponseHeaders;
const validatePositiveInteger = (name, n) => {
    if (typeof n !== 'number' || !Number.isInteger(n)) {
        throw new errors_js_1.AI21Error(`${name} must be an integer`);
    }
    if (n < 0) {
        throw new errors_js_1.AI21Error(`${name} must be a positive integer`);
    }
    return n;
};
async function defaultParseResponse({ response, options }) {
    if (options.stream) {
        if (!response.body) {
            throw new errors_js_1.AI21Error('Response body is null');
        }
        return new Streaming_1.Stream(response);
    }
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        return response.json();
    }
    return response.text();
}
class APIPromise extends Promise {
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
exports.APIPromise = APIPromise;
class APIClient {
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
    put(path, opts) {
        return this.makeRequest('put', path, opts);
    }
    delete(path, opts) {
        return this.makeRequest('delete', path, opts);
    }
    getUserAgent() {
        return `${this.constructor.name}/JS ${version_js_1.VERSION}`;
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
        const response = await (0, node_fetch_1.default)(url, {
            method: options.method,
            headers: headers,
            signal: controller.signal,
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        if (!response.ok) {
            throw new errors_js_1.AI21Error(`Request failed with status ${response.status}`);
        }
        return { response, options, controller };
    }
    static isRunningInBrowser() {
        return (typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof node_fetch_1.default === 'function');
    }
}
exports.APIClient = APIClient;
const readEnv = (env) => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env[env]?.trim() ?? undefined;
    }
    return undefined;
};
exports.readEnv = readEnv;
