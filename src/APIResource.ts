import type { APIClient } from './APIClient';

export class APIResource {
  protected _client: APIClient;

  constructor(client: APIClient) {
    this._client = client;
  }
}
