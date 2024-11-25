import { AI21 } from 'ai21';
import { FileResponse, UploadFileResponse } from '../../../src/types/rag';

async function waitForFileProcessing(client: AI21, fileId: string, interval: number = 3000): Promise<FileResponse> {
  while (true) {
    const file: FileResponse = await client.ragEngine.get(fileId);

    if (file.status === 'PROCESSED') {
      return file;
    }

    console.log(`File status is '${file.status}'. Waiting for it to be 'PROCESSED'...`);
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function uploadQueryUpdateDelete() {
  const client = new AI21({ apiKey: process.env.AI21_API_KEY });
  try {
    const uploadFileResponse: UploadFileResponse = await client.ragEngine.create(
      '/Users/amirkoblyansky/Documents/ukraine.txt', {path: "test10"});
    
    const fileId = uploadFileResponse.fileId
    let file: FileResponse = await waitForFileProcessing(client, fileId);
    console.log(file);

    console.log("Now updating the file labels");
    await client.ragEngine.update(uploadFileResponse.fileId, {labels: ["test99"], publicUrl: "https://www.miri.com"});
    file = await client.ragEngine.get(fileId);
    console.log(file);

    console.log("Now deleting the file");
    await client.ragEngine.delete(uploadFileResponse.fileId);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function listFiles() {
  const client = new AI21({ apiKey: process.env.AI21_API_KEY });
  const files = await client.ragEngine.list({limit: 10});
  console.log(files);
}

uploadQueryUpdateDelete().catch(console.error);

listFiles().catch(console.error);

