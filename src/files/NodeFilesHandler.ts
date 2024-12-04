import { FilePathOrFileObject } from 'types';
import { BaseFilesHandler } from './BaseFilesHandler';
import { FormDataRequest } from 'types/API';
import { isNode } from 'runtime';

export class NodeFilesHandler extends BaseFilesHandler {
  private async convertReadableStream(readableStream: ReadableStream): Promise<NodeJS.ReadableStream> {
    if (!isNode) {
      throw new Error('Stream conversion is not supported in browser environment');
    }

    const { Readable } = await import('stream');
    const reader = readableStream.getReader();

    return new Readable({
      async read() {
        const { done, value } = await reader.read();
        done ? this.push(null) : this.push(value);
      },
    });
  }

  private async handleStringFile(filePath: string, formData: any): Promise<void> {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!isNode) {
      throw new Error('File system operations are not supported in browser environment');
    }

    const fs = await import('fs').then((m) => m.default || m);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    formData.append('file', fs.createReadStream(filePath), {
      filename: filePath.split('/').pop(),
    });
  }

  async prepareFormDataRequest(file: FilePathOrFileObject): Promise<FormDataRequest> {
    try {
      const FormData = await import('form-data').then((m) => m.default || m);
      const formData = new FormData();

      if (typeof file === 'string') {
        await this.handleStringFile(file, formData);
        return this.createFormDataResponse(formData);
      }

      if (!file || typeof file !== 'object') {
        throw new Error(`Unsupported file type for Node.js file upload flow: ${file}`);
      }

      if ('buffer' in file) {
        formData.append('file', file.buffer, {
          filename: file.name,
          contentType: file.type,
        });
        return this.createFormDataResponse(formData);
      }

      if ('stream' in file && typeof file.stream === 'function') {
        const nodeStream = await this.convertReadableStream(file.stream());
        formData.append('file', nodeStream, {
          filename: file.name,
          contentType: file.type,
        });
        return this.createFormDataResponse(formData);
      }

      throw new Error(`Unsupported file type for Node.js file upload flow: ${file}`);
    } catch (error) {
      console.error('Error in prepareFormDataRequest:', error);
      throw error;
    }
  }

  private createFormDataResponse(formData: any): FormDataRequest {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      formData,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      },
    };
  }
}
