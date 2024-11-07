import type { APIClient } from './APIClient';

export class APIResource {
  protected client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }
}
