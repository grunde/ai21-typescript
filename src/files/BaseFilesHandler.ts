import { FormDataRequest } from 'types/API';
import { FilePathOrFileObject } from 'types/rag';

export abstract class BaseFilesHandler {
  abstract prepareFormDataRequest(file: FilePathOrFileObject): Promise<FormDataRequest>;
}
