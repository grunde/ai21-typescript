import * as Core from "./Core";
import { Chat } from "./resources/chat";
export declare class AI21 extends Core.APIClient {
    constructor(apiKey: string);
    protected authHeaders(opts: Core.FinalRequestOptions): Core.Headers;
    chat: Chat;
}
