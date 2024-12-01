import * as Models from '../../../../src/types';
import {ConversationalRag} from "../../../../src/resources/rag/conversationalRag";
import { APIClient } from '../../../../src/APIClient';
import { RAGEngine } from '../../../../src/resources/rag/ragEngine';


class MockAPIClient extends APIClient {
    public post = jest.fn();
    public upload = jest.fn();
    public get = jest.fn();
    public delete = jest.fn();
    public put = jest.fn();
  }
  

describe('ConversationalRag', () => {
  let convRag: ConversationalRag;
  let mockClient: MockAPIClient;
  const dummyAPIKey = "test-api-key";

  beforeEach(() => {
    mockClient = new MockAPIClient({
        baseURL: 'https://api.example.com',
        maxRetries: 3,
        timeout: 5000,
      });

      convRag = new ConversationalRag(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a conversational-rag response with answer_in_context false when relevant context is not found', async () => {
    const body = {messages: [{ role: 'user', content: 'What is the meaning of life?' }]}
    
    const options: Models.RequestOptions = { headers: { 'Authorization': `Bearer ${dummyAPIKey}` } };
    const expectedResponse: Models.ConversationalRagResponse = {
      id: '1e242c08-96e6-4592-b5ba-53065e30e865',
      choices: [
        {
          role: 'assistant',
          content: 'I couldn’t find any relevant information for: “What is the meaning of life?“. Please try to rephrase your question or ask about a different topic.'
        }
      ],
      search_queries: [ 'What is the meaning of life?' ],
      context_retrieved: true,
      answer_in_context: false,
      sources: []
    }

    mockClient.post.mockResolvedValue(expectedResponse);

    const response = await convRag.create(body, options);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/conversational-rag',
      { body, ...options }
    );
    expect(response).toEqual(expectedResponse);
  });


  it('should create a conversational-rag response with answer_in_context true and sources when relevant context is found', async () => {
    const body = {messages: [{ role: 'user', content: 'What is the OOO policy in our office?' }]}
    
    const options: Models.RequestOptions = { headers: { 'Authorization': `Bearer ${dummyAPIKey}` } };
    const expectedResponse: Models.ConversationalRagResponse = {
      id: '1e242c08-96e6-4592-b5ba-53065e30e865',
      choices: [
        {
          role: 'assistant',
          content: 'Staff must notify the office of planned or unexpected absences, set automated OOO messages, and designate a backup to handle urgent matters, ensuring uninterrupted client service. All case files and tasks must be updated and accessible to the backup as needed.'
        }
      ],
      search_queries: [ 'What is the OOO policy in our office?' ],
      context_retrieved: true,
      answer_in_context: true,
      sources: [
        {
          text: 'Employees must inform the office of any absence, activate OOO messages, and assign a backup to address urgent needs. Ensure all files and tasks are updated for seamless client service.',
          file_id: '4d20257a-9aee-47f9-9f57-bbf812955ee0',
          file_name: 'policies/OOO_policy.pdf',
          score: 0.85128105,
          order: 92,
          public_url: null,
          labels: []
        }
      ]
    }

    mockClient.post.mockResolvedValue(expectedResponse);

    const response = await convRag.create(body, options);

    expect(mockClient.post).toHaveBeenCalledWith(
      '/conversational-rag',
      { body, ...options }
    );
    expect(response).toEqual(expectedResponse);
  });
});

describe('RAGEngine', () => {
  let ragEngine: RAGEngine;
  let mockClient: MockAPIClient;
  const dummyAPIKey = "test-api-key";

  beforeEach(() => {
    mockClient = new MockAPIClient({
      baseURL: 'https://api.example.com',
      maxRetries: 3,
      timeout: 5000,
    });

    ragEngine = new RAGEngine(mockClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload a file and return the response', async () => {
    const fileInput = 'path/to/file.txt';
    const body = { path: 'label' };
    const expectedResponse = { fileId: '12345' };

    mockClient.upload.mockResolvedValue(expectedResponse);

    const response = await ragEngine.create(fileInput, body);

    expect(mockClient.upload).toHaveBeenCalledWith(
      '/library/files',
      fileInput,
      { body, headers: undefined }
    );
    expect(response).toEqual(expectedResponse);
  });

  it('should get a file by ID and return the response', async () => {
    const fileId = '12345';
    const expectedResponse = { id: fileId, name: 'file.txt' };

    mockClient.get.mockResolvedValue(expectedResponse);

    const response = await ragEngine.get(fileId);

    expect(mockClient.get).toHaveBeenCalledWith(
      `/library/files/${fileId}`,
      undefined
    );
    expect(response).toEqual(expectedResponse);
  });

  it('should delete a file by ID', async () => {
    const fileId = '12345';

    mockClient.delete.mockResolvedValue(null);

    const response = await ragEngine.delete(fileId);

    expect(mockClient.delete).toHaveBeenCalledWith(
      `/library/files/${fileId}`,
      undefined
    );
    expect(response).toBeNull();
  });

  it('should update a file by ID and return null', async () => {
    const fileId = '12345';
    const body = { labels: ['test'], publicUrl: 'https://example.com' };

    mockClient.put.mockResolvedValue(null);

    const response = await ragEngine.update(fileId, body);

    expect(mockClient.put).toHaveBeenCalledWith(
      `/library/files/${fileId}`,
      { body, headers: undefined }
    );
    expect(response).toBeNull();
  });

  it('should list files and return the response', async () => {
    const filters = { limit: 4 };
    const expectedResponse = [{ id: '12345', name: 'file.txt' }];

    mockClient.get.mockResolvedValue(expectedResponse);

    const response = await ragEngine.list(filters);

    expect(mockClient.get).toHaveBeenCalledWith(
      '/library/files',
      { query: filters, headers: undefined }
    );
    expect(response).toEqual(expectedResponse);
  });
});
