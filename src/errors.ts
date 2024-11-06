export class AI21Error extends Error {}

export class MissingAPIKeyError extends AI21Error {
  constructor() {
    super('API key is required');
  }
}

export class StreamingDecodeError extends Error {
  constructor(chunk: string) {
    super(`Failed to decode chunk: ${chunk}`);
  }
}
