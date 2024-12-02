import { FilePathOrFileObject } from "./FilePathOrFileObject";

export interface UploadFileRequest {
  file: FilePathOrFileObject
  path?: string | null;
  labels?: string[] | null;
  publicUrl?: string | null;
}
