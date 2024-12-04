import * as Models from '../../types';
import { APIResource } from '../../APIResource';
import { UploadFileResponse, UploadFileRequest, ListFilesFilters, UpdateFileRequest } from '../../types/rag';
import { FileResponse } from 'types/rag/FileResponse';

const FILES_PATH = '/library/files';

export class Files extends APIResource {
  async create(body: UploadFileRequest, options?: Models.RequestOptions): Promise<UploadFileResponse> {
    const { file, ...bodyWithoutFile } = body;
    return this.client.upload<Models.UnifiedFormData, UploadFileResponse>(FILES_PATH, file, {
      body: bodyWithoutFile,
      ...options,
    } as Models.RequestOptions<Models.UnifiedFormData>) as Promise<UploadFileResponse>;
  }

  get(fileId: string, options?: Models.RequestOptions): Promise<FileResponse> {
    return this.client.get<string, FileResponse>(
      `${FILES_PATH}/${fileId}`,
      options as Models.RequestOptions<string>,
    ) as Promise<FileResponse>;
  }

  delete(fileId: string, options?: Models.RequestOptions): Promise<null> {
    return this.client.delete<string, null>(
      `${FILES_PATH}/${fileId}`,
      options as Models.RequestOptions<string>,
    ) as Promise<null>;
  }

  list(body?: ListFilesFilters, options?: Models.RequestOptions): Promise<FileResponse[]> {
    return this.client.get<ListFilesFilters | null, FileResponse[]>(FILES_PATH, {
      query: body,
      ...options,
    } as Models.RequestOptions<ListFilesFilters | null>) as Promise<FileResponse[]>;
  }

  update(body: UpdateFileRequest, options?: Models.RequestOptions): Promise<null> {
    return this.client.put<UpdateFileRequest, null>(`${FILES_PATH}/${body.fileId}`, {
      body,
      ...options,
    } as Models.RequestOptions<UpdateFileRequest>) as Promise<null>;
  }
}
