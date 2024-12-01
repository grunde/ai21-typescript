import * as Models from '../../../src/types';
import { RAGEngine } from '../../../src/resources/rag/ragEngine';
import { APIClient } from '../../../src/APIClient';

class MockAPIClient extends APIClient {
  public upload = jest.fn();
  public get = jest.fn();
  public delete = jest.fn();
  public put = jest.fn();
}

describe('RAGEngine', () => {
  let ragEngine: RAGEngine;
  let mockClient: MockAPIClient;
  const dummyAPIKey = "test-api-key";
  const options: Models.RequestOptions = { headers: { 'Authorization': `Bearer ${dummyAPIKey}` } };

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

  it('should upload a file and return the fileId', async () => {
    const fileInput = 'path/to/file.txt';
    const body = { path: 'label' };
    const expectedResponse = { fileId: '12345' };

    mockClient.upload.mockResolvedValue(expectedResponse);

    const response = await ragEngine.create(fileInput, body, options);

    expect(mockClient.upload).toHaveBeenCalledWith(
      '/library/files',
      fileInput,
      { body, headers: { 'Authorization': `Bearer ${dummyAPIKey}` } }
    );
    expect(response).toEqual(expectedResponse);
  });

  it('should get a file by ID and return the response', async () => {
    const fileId = '12345';
    const expectedResponse = { id: fileId, name: 'file.txt' };

    mockClient.get.mockResolvedValue(expectedResponse);

    const response = await ragEngine.get(fileId, options);

    expect(mockClient.get).toHaveBeenCalledWith(
      `/library/files/${fileId}`,
      { headers: { 'Authorization': `Bearer ${dummyAPIKey}` } }
    );
    expect(response).toEqual(expectedResponse);
  });

  it('should delete a file by ID', async () => {
    const fileId = '12345';

    mockClient.delete.mockResolvedValue(null);

    const response = await ragEngine.delete(fileId, options);

    expect(mockClient.delete).toHaveBeenCalledWith(
      `/library/files/${fileId}`,
      { headers: { 'Authorization': `Bearer ${dummyAPIKey}` } }
    );
    expect(response).toBeNull();
  });

  it('should update a file by ID and return null', async () => {
    const fileId = '12345';
    const body = { labels: ['test'], publicUrl: 'https://example.com' };

    mockClient.put.mockResolvedValue(null);

    const response = await ragEngine.update(fileId, body, options);

    expect(mockClient.put).toHaveBeenCalledWith(
      `/library/files/${fileId}`,
      { body, headers: { 'Authorization': `Bearer ${dummyAPIKey}` } }
    );
    expect(response).toBeNull();
  });

  it('should list files and return the response', async () => {
    const filters = { limit: 4 };
    const expectedResponse = [{ id: '12345', name: 'file.txt' }];

    mockClient.get.mockResolvedValue(expectedResponse);

    const response = await ragEngine.list(filters, options);

    expect(mockClient.get).toHaveBeenCalledWith(
      '/library/files',
      { query: filters, headers: { 'Authorization': `Bearer ${dummyAPIKey}` } }
    );
    expect(response).toEqual(expectedResponse);
  });
});
