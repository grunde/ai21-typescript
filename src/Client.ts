import * as Core from "./Core";
import { Chat } from "./resources/chat";

export class AI21 extends Core.APIClient {
    constructor(apiKey: string) {
        super({
            baseURL: 'https://api.ai21.com/studio/v1',
            timeout: 60000,
            apiKey,
            options: {}
        });
    }

    protected override authHeaders(opts: Core.FinalRequestOptions): Core.Headers {
        return {
            'Authorization': `Bearer ${this.apiKey}`
        };
    }

    chat: Chat = new Chat(this);
}
