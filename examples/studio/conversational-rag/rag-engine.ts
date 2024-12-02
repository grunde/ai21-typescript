import { AI21 } from 'ai21';
import { FileResponse, UploadFileResponse } from '../../../src/types/rag';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadGetUpdateDelete(fileInput, path) {
  const client = new AI21({ apiKey: process.env.AI21_API_KEY });
  try {
    const uploadFileResponse: UploadFileResponse = await client.ragEngine.create({
      file: fileInput,
      path: path,
    });
    console.log(uploadFileResponse);
    let file: FileResponse = await client.ragEngine.get(uploadFileResponse.fileId);
    console.log(file);
    await sleep(1000); // Give it a sec to start process before updating
    console.log('Now updating the file labels and publicUrl...');
    await client.ragEngine.update({
      fileId: uploadFileResponse.fileId,
      labels: ['test99'],
      publicUrl: 'https://www.miri.com',
    });
    file = await client.ragEngine.get(uploadFileResponse.fileId);
    console.log(file);

    console.log('Now deleting the file');
    await client.ragEngine.delete(uploadFileResponse.fileId);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function listFiles() {
  const client = new AI21({ apiKey: process.env.AI21_API_KEY });
  const files = await client.ragEngine.list({ limit: 4 });
  console.log(files);
}

/* Simulate a file upload passing file path */
const filePath = '/Users/amirkoblyansky/Documents/ukraine.txt';
uploadGetUpdateDelete(filePath, Date.now().toString()).catch(console.error);

/* Simulate a file upload passing File instance */
const fileContent = Buffer.from(
  'Opossums are members of the marsupial order Didelphimorphia endemic to the Americas.',
);
const dummyFile = new File([fileContent], 'example.txt', { type: 'text/plain' });
uploadGetUpdateDelete(dummyFile, Date.now().toString()).catch(console.error);

listFiles().catch(console.error);
