import { APIClient, FinalRequestOptions, Headers } from "./Core.js";
export declare class AI21 extends APIClient {
    constructor(apiKey: string);
    protected authHeaders(opts: FinalRequestOptions): Headers;
    createChatCompletion(model: string, messages: Array<{
        role: string;
        content: string;
    }>): Promise<{
        completion: string;
    }>;
}
