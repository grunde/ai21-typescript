import { FilePathOrFileObject } from 'types/rag';
import { BaseFilesHandler } from './BaseFilesHandler';
import { FormDataRequest } from 'types/API';

export class NodeFilesHandler extends BaseFilesHandler {
  private async convertReadableStream(readableStream: ReadableStream): Promise<NodeJS.ReadableStream> {
    const { Readable } = await import('stream');
    const reader = readableStream.getReader();

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

  async prepareFormDataRequest(file: FilePathOrFileObject): Promise<FormDataRequest> {
    const { default: FormDataNode } = await import('form-data');
    const formData = new FormDataNode();

    if (typeof file === 'string') {
      const fs = (await import('fs')).default;
      formData.append('file', fs.createReadStream(file), { filename: file.split('/').pop() });
    } else if (file instanceof File) {
      const nodeStream = await this.convertReadableStream(file.stream());
      formData.append('file', nodeStream, file.name);
    } else {
      throw new Error(`Unsupported file type for Node.js file upload flow: ${file}`);
    }

    const formDataHeaders = { 'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}` };

    return { formData, headers: formDataHeaders };
  }
}
