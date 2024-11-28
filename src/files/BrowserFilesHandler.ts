import { UnifiedFormData } from 'types';
import { FilePathOrFileObject } from 'types/rag';
import { BaseFilesHandler } from './BaseFilesHandler';

export class BrowserFilesHandler extends BaseFilesHandler {
  async createFormData(file: FilePathOrFileObject): Promise<UnifiedFormData> {
    const formData = new FormData();

    if (file instanceof window.File) {
      formData.append('file', file);
    } else {
      throw new Error('Unsupported file type in browser');
    }

    return formData;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMultipartFormDataHeaders(formData: UnifiedFormData): Record<string, string> | null {
    return {};
  }
}
