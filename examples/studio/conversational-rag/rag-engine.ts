import { AI21, FileResponse, UploadFileResponse, isNode } from 'ai21';
import path from 'path';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFileProcessing(
  client: AI21,
  fileId: string,
  timeout: number = 30000,
  interval: number = 1000,
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const file: FileResponse = await client.files.get(fileId);
    if (file.status !== 'PROCESSING') {
      return file;
    }
    await sleep(interval);
  }

  throw new Error(`File processing timed out after ${timeout}ms`);
}

async function uploadGetUpdateDelete(fileInput, path) {
  const client = new AI21({ apiKey: process.env.AI21_API_KEY });
  try {
    const uploadFileResponse: UploadFileResponse = await client.files.create({
      file: fileInput,
      path: path,
    });
    console.log(uploadFileResponse);

    let file: FileResponse = await waitForFileProcessing(client, uploadFileResponse.fileId);
    console.log(file);

    if (file.status === 'PROCESSED') {
      console.log('Now updating the file labels and publicUrl...');
      await client.files.update({
        fileId: uploadFileResponse.fileId,
        labels: ['test99'],
        publicUrl: 'https://www.miri.com',
      });
      file = await client.files.get(uploadFileResponse.fileId);
      console.log(file);
    } else {
      console.log(`File did not processed well, ended with status ${file.status}`);
    }

    console.log('Now deleting the file');
    await client.files.delete(uploadFileResponse.fileId);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function listFiles() {
  const client = new AI21({ apiKey: process.env.AI21_API_KEY });
  const files = await client.files.list({ limit: 4 });
  console.log(files);
}

/* Simulate file upload passing a path to file */
const filePath = path.join(process.cwd(), 'examples/studio/conversational-rag/files', 'meerkat.txt'); // Use process.cwd() to get the current working directory

uploadGetUpdateDelete(filePath, Date.now().toString()).catch(console.error);

/* Simulate file upload passing File instance */
const fileContent = Buffer.from(
  'Opossums are members of the marsupial order Didelphimorphia endemic to the Americas.',
);
const dummyFile = new File([fileContent], 'example.txt', { type: 'text/plain' });

if (isNode){
  uploadGetUpdateDelete(dummyFile, Date.now().toString()).catch(console.error);
  listFiles().catch(console.error);
}
else{
  // TODO - add node support for files
  console.log('Cannot run uploads in not Node environment');
}
