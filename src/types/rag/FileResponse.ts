export interface FileResponse {
  fileId: string;
  name: string;
  fileType: string;
  sizeBytes: number;
  createdBy: string;
  creationDate: Date;
  lastUpdated: Date;
  status: string;
  path?: string | null;
  labels?: string[] | null;
  publicUrl?: string | null;
  errorCode?: number | null;
  errorMessage?: string | null;
}
