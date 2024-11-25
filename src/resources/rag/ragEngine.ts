import * as Models from '../../types';
import { APIResource } from '../../APIResource';
import { UploadFileResponse, UploadFileRequest, ListFilesFilters, UpdateFileRequest } from '../../types/rag';
import { FileResponse } from 'types/rag/FileResponse';

const RAG_ENGINE_PATH = '/library/files';

export class RAGEngine extends APIResource {
  create(filePath: string, body: UploadFileRequest, options?: Models.RequestOptions) {
    return this.client.upload<UploadFileRequest, UploadFileResponse>(RAG_ENGINE_PATH, filePath, {
      body: body,
      ...options,
    } as Models.RequestOptions<UploadFileRequest>) as Promise<UploadFileResponse>;
  }

  get(fileId: string, options?: Models.RequestOptions) {
    return this.client.get<string, FileResponse>(
      `${RAG_ENGINE_PATH}/${fileId}`,
      options as Models.RequestOptions<string>,
    ) as Promise<FileResponse>;
  }

  delete(fileId: string, options?: Models.RequestOptions) {
    return this.client.delete<string, null>(
      `${RAG_ENGINE_PATH}/${fileId}`,
      options as Models.RequestOptions<string>,
    ) as Promise<null>;
  }

  list(body: ListFilesFilters | null, options?: Models.RequestOptions) {
    return this.client.get<ListFilesFilters | null, FileResponse[]>(RAG_ENGINE_PATH, {
      query: body,
      ...options,
    } as Models.RequestOptions<ListFilesFilters | null>) as Promise<FileResponse[]>;
  }

  update(fileId: string, body: UpdateFileRequest, options?: Models.RequestOptions) {
    return this.client.put<UpdateFileRequest, null>(`${RAG_ENGINE_PATH}/${fileId}`, {
      body,
      ...options,
    } as Models.RequestOptions<UpdateFileRequest>) as Promise<null>;
  }
}
