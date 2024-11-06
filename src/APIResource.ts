import type { AI21 } from "./index";

export class APIResource { 
    protected _client: AI21;

    constructor(client: AI21) {
        this._client = client;
    }
}
