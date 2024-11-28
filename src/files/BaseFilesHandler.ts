import { UnifiedFormData } from 'types';
import { FilePathOrFileObject } from 'types/rag';

export abstract class BaseFilesHandler {
  abstract createFormData(file: FilePathOrFileObject): Promise<UnifiedFormData>;

  abstract getMultipartFormDataHeaders(formData: UnifiedFormData): Record<string, string> | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appendBodyToFormData = (formData: UnifiedFormData, body: Record<string, any>): void => {
    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    }
  };
}
