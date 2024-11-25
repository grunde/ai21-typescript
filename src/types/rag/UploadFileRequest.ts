export interface UpdateFileRequest {
  labels?: string[] | null;
  publicUrl?: string | null;
}

export interface UploadFileRequest extends UpdateFileRequest {
  path?: string | null;
}
