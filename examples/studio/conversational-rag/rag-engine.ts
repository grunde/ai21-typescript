import { AI21, FileResponse, UploadFileResponse } from 'ai21';
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
    console.log(`Uploading file with id ${fileInput}`);
    const uploadFileResponse: UploadFileResponse = await client.files.create({
      file: fileInput,
      path: path,
    });
    console.log(`Uploaded file with id ${uploadFileResponse}`);

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
  console.log(`Listed files: ${files}`);
}

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

if (isBrowser) {
  console.log('Cannot run upload examples in Browser environment');
} else {
  /* Run all operations sequentially */
  (async () => {
    try {
      // First operation - upload file from path
      const filePath = path.join(process.cwd(), 'examples/studio/conversational-rag/files', 'meerkat.txt');
      await uploadGetUpdateDelete(filePath, Date.now().toString());

      // Second operation - upload file from File instance
      const fileContent = Buffer.from(
        'Opossums are members of the marsupial order Didelphimorphia endemic to the Americas.',
      );
      const dummyFile = new File([fileContent], 'example.txt', { type: 'text/plain' });
      console.log('Running file upload in Node environment');
      await uploadGetUpdateDelete(dummyFile, Date.now().toString());

      // Finally, list the files
      await listFiles();
    } catch (error) {
      console.error(error);
    }
  })();
}
