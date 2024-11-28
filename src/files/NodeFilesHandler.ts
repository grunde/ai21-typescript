import { UnifiedFormData } from "types";
import { FilePathOrFileObject } from "types/rag";
import { BaseFilesHandler } from "./BaseFilesHandler";

  export class NodeFilesHandler extends BaseFilesHandler  {

    async convertReadableStream(whatwgStream: ReadableStream): Promise<NodeJS.ReadableStream> {
      const { Readable } = await import('stream');
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

    async getBoundary(formData: UnifiedFormData): Promise<string | undefined> {
      const { default: FormDataNode } = await import('form-data');
        if (formData instanceof FormDataNode) {
          return formData.getBoundary();
        }
        else {
          throw new Error('getBoundary invoked with native browser FormData instance instead of NodeJS form-data');
        }
    }
    

    async createFormData(file: FilePathOrFileObject): Promise<UnifiedFormData> {
      const { default: FormDataNode } = await import('form-data');
        const formData = new FormDataNode();
  
        if (typeof file === 'string') {
          const fs = (await import('fs')).default;
          formData.append('file', fs.createReadStream(file), { filename: file.split('/').pop() });
        } else if (Buffer.isBuffer(file)) {
          formData.append('file', file, { filename: 'TODO - add filename to buffer flow' });
        } else if (file instanceof File) {
          const nodeStream = await this.convertReadableStream(file.stream());
          formData.append('file', nodeStream, file.name);
        } else {
          throw new Error(`Unsupported file type for Node.js file upload flow: ${file}`);
        }
  
        return formData;
    }

    getMultipartFormDataHeaders(formData: UnifiedFormData): Record<string, string> | null {
      if (formData instanceof FormData) {
        return null;
      }

      const boundary = formData.getBoundary();
        return {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        };
      }
  
    }
  