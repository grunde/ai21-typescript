import { Response as NodeResponse } from 'node-fetch';
import { Readable } from 'stream';

export type Constructor<T> = {
  new (...args: any[]): T;
  from_dict?: (dict: any) => T;
};

export class StreamingDecodeError extends Error {
  constructor(chunk: string) {
    super(`Failed to decode chunk: ${chunk}`);
  }
}

const SSE_DATA_PREFIX = 'data: ';
const SSE_DONE_MSG = '[DONE]';

function getStreamMessage<T>(chunk: string): T {
  try {
    return JSON.parse(chunk);
  } catch (e) {
    throw new StreamingDecodeError(chunk);
  }
}

interface SSEDecoder {
  decode(line: string): string | null;
  iterLines(response: NodeResponse): AsyncIterableIterator<string>;
}

class DefaultSSEDecoder implements SSEDecoder {
  decode(line: string): string | null {
    if (!line) return null;

    if (line.startsWith(SSE_DATA_PREFIX)) {
      return line.slice(SSE_DATA_PREFIX.length);
    }

    throw new StreamingDecodeError(`Invalid SSE line: ${line}`);
  }

  async *iterLines(response: NodeResponse): AsyncIterableIterator<string> {
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const webReadableStream = Readable.toWeb(response.body as any) as ReadableStream;
    const reader = webReadableStream.getReader();

    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (buffer.length > 0) {
            const decoded = this.decode(buffer.trim());
            if (decoded) yield decoded;
          }
          break;
        }

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const decoded = this.decode(line.trim());
          if (decoded) yield decoded;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export class Stream<T> implements AsyncIterableIterator<T> {
  private decoder: SSEDecoder;
  private iterator: AsyncIterableIterator<T>;

  constructor(
    private response: NodeResponse,
    //   private castTo: Constructor<T>,
    decoder?: SSEDecoder,
  ) {
    this.decoder = decoder || new DefaultSSEDecoder();
    this.iterator = this.stream();
  }

  private async *stream(): AsyncIterableIterator<T> {
    for await (const chunk of this.decoder.iterLines(this.response)) {
      if (chunk === SSE_DONE_MSG) break;
      yield getStreamMessage(chunk);
    }
  }
  async next(): Promise<IteratorResult<T>> {
    return this.iterator.next();
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }
}
