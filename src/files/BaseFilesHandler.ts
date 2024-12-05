import { FilePathOrFileObject } from 'types';
import { FormDataRequest } from 'types/API';

export abstract class BaseFilesHandler {
  abstract prepareFormDataRequest(file: FilePathOrFileObject): Promise<FormDataRequest>;
}
