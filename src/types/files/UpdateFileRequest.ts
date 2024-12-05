export interface UpdateFileRequest {
  fileId: string;
  labels?: string[] | null;
  publicUrl?: string | null;
}
