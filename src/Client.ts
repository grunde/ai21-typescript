import { APIClient, FinalRequestOptions, Headers } from "./Core.js";

export class AI21 extends APIClient {
    constructor(apiKey: string) {
        super({
            baseURL: 'https://api.ai21.com/studio/v1',
            timeout: 60000,
            apiKey,
            options: {}
        });
    }

    protected override authHeaders(opts: FinalRequestOptions): Headers {
        return {
            'Authorization': `Bearer ${this.apiKey}`
        };
    }

    // Create a method for chat completions
    public async createChatCompletion(model: string, messages: Array<{ role: string, content: string }>) {
        return this.post<
            { model: string, messages: Array<{ role: string, content: string }> },
            { completion: string }
        >('/chat/completions', {
            body: { model, messages }
        });
    }
}
