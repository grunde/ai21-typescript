import * as Models from '../../types';
import { APIResource } from '../../APIResource';
import { ConversationalRagRequest } from '../../types';
import { ConversationalRagResponse } from '../../types';

export class ConversationalRag extends APIResource {
  create(body: ConversationalRagRequest, options?: Models.RequestOptions) {
    return this.client.post<ConversationalRagRequest, ConversationalRagResponse>('/conversational-rag', {
      body,
      ...options,
    } as Models.RequestOptions<ConversationalRagRequest>) as Promise<ConversationalRagResponse>;
  }
}
