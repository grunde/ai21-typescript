import { FilePathOrFileObject } from 'types';
import { BaseFilesHandler } from './BaseFilesHandler';
import { FormDataRequest } from 'types/API';

export class BrowserFilesHandler extends BaseFilesHandler {
  async prepareFormDataRequest(file: FilePathOrFileObject): Promise<FormDataRequest> {
    const formData = new FormData();
    formData.append('file', file);
    // Note that when uploading files in a browser, the browser handles the multipart/form-data headers
    return { formData, headers: {} };
  }
}
