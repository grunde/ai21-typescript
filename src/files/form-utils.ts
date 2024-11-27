import { FilePathOrFileObject } from 'types/rag';
import * as Runtime from '../runtime';

export type UnifiedFormData = FormData | import('form-data');

import { Readable } from 'stream';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const appendBodyToFormData = (formData: UnifiedFormData, body: Record<string, any>): void => {
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, value);
    }
  }
};

// Convert WHATWG ReadableStream to Node.js Readable Stream
function convertReadableStream(whatwgStream: ReadableStream): Readable {
  const reader = whatwgStream.getReader();

  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
  });
}

export async function createFormData(file: FilePathOrFileObject): Promise<UnifiedFormData> {
  if (Runtime.isBrowser) {
    const formData = new FormData();

    if (file instanceof window.File) {
      formData.append('file', file);
    } else {
      throw new Error('Unsupported file type in browser');
    }

    return formData;
  } else {
    // Node environment:

    const { default: FormDataNode } = await import('form-data');
    const formData = new FormDataNode();

    if (typeof file === 'string') {
      const { createReadStream } = await import('fs');
      formData.append('file', createReadStream(file), { filename: file.split('/').pop() });
    } else if (Buffer.isBuffer(file)) {
      formData.append('file', file, { filename: 'TODO - add filename to buffer flow' });
    } else if (file instanceof File) {
      const nodeStream = convertReadableStream(file.stream());
      formData.append('file', nodeStream, file.name);
    } else {
      throw new Error('Unsupported file type in Node.js');
    }

    return formData;
  }
}

export async function getBoundary(formData: UnifiedFormData): Promise<string | undefined> {
  if (!Runtime.isBrowser) {
    const { default: FormDataNode } = await import('form-data');
    if (formData instanceof FormDataNode) {
      return formData.getBoundary();
    }
  }
  return undefined;
}
