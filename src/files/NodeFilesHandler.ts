import { FilePathOrFileObject } from 'types';
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
    console.log('Preparing form data request for Node.js');
    try {
      const FormData = await import('form-data').then((m) => m.default || m);
      console.log('Successfully imported form-data module');

      const formData = new FormData();
      console.log('Created new FormData instance');

      if (typeof file === 'string') {
        const fs = await import('fs').then((m) => m.default || m);
        if (!fs.existsSync(file)) {
          throw new Error(`File not found: ${file}`);
        }
        console.log(`Appending file from path: ${file}`);
        formData.append('file', fs.createReadStream(file), { filename: file.split('/').pop() });
      } else if (file instanceof File) {
        console.log('Converting ReadableStream to Node stream');
        const nodeStream = await this.convertReadableStream(file.stream());
        console.log('Appending file from File instance');
        formData.append('file', nodeStream, file.name);
      } else {
        throw new Error(`Unsupported file type for Node.js file upload flow: ${file}`);
      }

      const formDataHeaders = { 'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}` };
      console.log('FormData preparation completed successfully');

      return { formData, headers: formDataHeaders };
    } catch (error) {
      console.error('Error in prepareFormDataRequest:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}
