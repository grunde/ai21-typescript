import * as Core from './Core';
import * as Models from './types';
import { AI21EnvConfig } from './EnvConfig';
import { MissingAPIKeyError } from './errors';
import { Chat } from './resources/chat';

export interface AI21Options {
  apiKey: string;
  baseURL: string;
  via: string | null;
  timeout: number;
  maxRetries: number;
}
export class AI21 extends Core.APIClient {
  private apiKey: string;
  private _options: AI21Options;

  constructor(
    apiKey: string = AI21EnvConfig.API_KEY,
    baseURL: string = AI21EnvConfig.BASE_URL,
    timeout: number = AI21EnvConfig.TIMEOUT_SECONDS,
    maxRetries: number = AI21EnvConfig.MAX_RETRIES,
    via: string | null = null,
  ) {
    const options: AI21Options = {
      apiKey,
      baseURL,
      via,
      timeout,
      maxRetries,
    };

    super({
      baseURL,
      timeout,
      maxRetries,
      options: {},
    });

    if (!apiKey) {
      throw new MissingAPIKeyError();
    }

    this.apiKey = apiKey;
    this._options = options;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected override authHeaders(_: Models.FinalRequestOptions): Core.Headers {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  protected override defaultHeaders(opts: Models.FinalRequestOptions): Core.Headers {
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
