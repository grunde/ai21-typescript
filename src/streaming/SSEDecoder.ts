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

  protected abstract getReader(response: CrossPlatformResponse): ReadableStreamDefaultReader<Uint8Array>;

  async *iterLines(response: CrossPlatformResponse): AsyncIterableIterator<string> {
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    yield* this._iterLines(this.getReader(response));
  }

  async *_iterLines(reader: ReadableStreamDefaultReader<Uint8Array>): AsyncIterableIterator<string> {
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

export class BrowserSSEDecoder extends BaseSSEDecoder {
  protected getReader(response: CrossPlatformResponse): ReadableStreamDefaultReader<Uint8Array> {
    const body = response.body as ReadableStream<Uint8Array>;
    return body.getReader();
  }
}

export class NodeSSEDecoder extends BaseSSEDecoder {
  protected getReader(response: CrossPlatformResponse): ReadableStreamDefaultReader<Uint8Array> {
    const stream = response.body as NodeJS.ReadableStream;
    // Convert Node readable stream to Web readable stream
    const webStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const uint8Array = typeof chunk === 'string' 
              ? new TextEncoder().encode(chunk)
              : chunk instanceof Uint8Array 
                ? chunk 
                : new Uint8Array(chunk);
            controller.enqueue(uint8Array);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    return webStream.getReader();
  }
}
