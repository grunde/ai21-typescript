import * as Core from "./Core";
import { Chat } from "./resources/chat";

export interface AI21Options {
    apiKey: string;
    baseURL: string;
    via: string | null;
}
export class AI21 extends Core.APIClient {
    private _options: AI21Options;

    constructor(
        apiKey: string = process.env.AI21_API_KEY || '',
        baseURL: string = process.env.AI21_BASE_URL || 'https://api.ai21.com/studio/v1',
        via: string | null,
    ) {
        const options: AI21Options = {
            apiKey,
            baseURL,
            via,
        };

        super({
            baseURL,
            timeout: 60000,
            apiKey,
            options: {}
        });

        this._options = options;
    }

    protected override authHeaders(opts: Core.FinalRequestOptions): Core.Headers {
        return {
            'Authorization': `Bearer ${this.apiKey}`
        };
    }

    protected override defaultHeaders(opts: Core.FinalRequestOptions): Core.Headers {
        return {
          ...super.defaultHeaders(opts),
          'User-Agent': this.getUserAgent(),
        };
      }
    
    protected override getUserAgent(): string {
        let userAgent = super.getUserAgent();
        
        if (this._options.via) {
            userAgent += ` via ${this._options.via}`;
        }
        return userAgent;
    }

    chat: Chat = new Chat(this);
}
