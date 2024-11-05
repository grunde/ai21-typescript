import { APIClient } from "./Core.js";
export class AI21 extends APIClient {
    constructor(apiKey) {
        super({
            baseURL: 'https://api.ai21.com/studio/v1',
            timeout: 60000,
            apiKey,
            options: {}
        });
    }
    // Override auth headers to include API key
    authHeaders(opts) {
        return {
            'Authorization': `Bearer ${this.apiKey}`
        };
    }
    // Create a method for chat completions
    async createChatCompletion(model, messages) {
        return this.post('/chat/completions', {
            body: { model, messages }
        });
    }
}
