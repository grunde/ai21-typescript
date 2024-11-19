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

  protected processLine(line: string): string {
    if (line.startsWith('data: ')) {
      return line.slice(6);
    }
    return line;
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

        for (const line of lines) {
          if (line.trim()) {
            yield this.processLine(line);
          }
        }
      }

      if (buffer.trim()) {
        yield this.processLine(buffer);
      }
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

      for (const line of lines) {
        if (line.trim()) {
          yield this.processLine(line);
        }
      }
    }

    if (buffer.trim()) {
      yield this.processLine(buffer);
    }
  }
}
