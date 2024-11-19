import { SSE_DATA_PREFIX } from './Consts';
import { StreamingDecodeError } from '../errors';
import { CrossPlatformResponse } from 'types';

export interface SSEDecoder {
  decode(line: string): string | null;
  iterLines(response: CrossPlatformResponse): AsyncIterableIterator<string>;
}

abstract class BaseSSEDecoder implements SSEDecoder {
  decode(line: string): string | null {
    if (!line) return null;

    if (line.startsWith(SSE_DATA_PREFIX)) {
      return line.slice(SSE_DATA_PREFIX.length);
    }

    throw new StreamingDecodeError(`Invalid SSE line: ${line}`);
  }

  abstract iterLines(response: CrossPlatformResponse): AsyncIterableIterator<string>;

  protected async *_iterLines(lines: string[]): AsyncIterableIterator<string> {
    for (const line of lines) {
      if (line.trim()) {
        const decoded = this.decode(line);
        if (decoded) {
          yield decoded;
        }
      }
    }
  }

  protected async *readBuffer(buffer: string): AsyncIterableIterator<string> {
    if (buffer.trim()) {
      const decoded = this.decode(buffer);
      if (decoded) {
        yield decoded;
      }
    }
  }
}

export class BrowserSSEDecoder extends BaseSSEDecoder {
  async *iterLines(response: CrossPlatformResponse): AsyncIterableIterator<string> {
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = (response.body as ReadableStream<Uint8Array>).getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r\n|\n/);
        buffer = lines.pop() || '';

        yield* this._iterLines(lines);
      }

      yield* this.readBuffer(buffer);
    } finally {
      reader.releaseLock();
    }
  }
}

export class NodeSSEDecoder extends BaseSSEDecoder {
  async *iterLines(response: CrossPlatformResponse): AsyncIterableIterator<string> {
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const stream = response.body as NodeJS.ReadableStream;
    let buffer = '';

    for await (const chunk of stream) {
      const text = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
      buffer += text;
      const lines = buffer.split(/\r\n|\n/);
      buffer = lines.pop() || '';

      yield* this._iterLines(lines);
    }

    yield* this.readBuffer(buffer);
  }
}
