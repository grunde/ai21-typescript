import { AI21 } from 'ai21';

async function main() {
  console.log('Environment:', {
    nodeVersion: process.version,
    environment: process.env.NODE_ENV,
  });

  if (!process.env.AI21_API_KEY) {
    throw new Error('AI21_API_KEY is not set');
  }
  console.log('API Key present:', !!process.env.AI21_API_KEY);

  const client = new AI21({ apiKey: process.env.AI21_API_KEY });

  try {
    console.log('Initiating stream request...');
    const streamResponse = await client.chat.completions.create({
      model: 'jamba-1.5-mini',
      messages: [{ role: 'user', content: 'Hello, how are you? tell me a short story' }],
      stream: true,
    });

    console.log('Response received:', {
      type: typeof streamResponse,
      constructor: streamResponse?.constructor?.name,
    });

    for await (const chunk of streamResponse) {
      if (chunk?.choices?.[0]?.delta?.content) {
        process.stdout.write(chunk.choices[0].delta.content);
      }
    }
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const timeout = setTimeout(() => {
  console.error('Script timed out after 30 seconds');
  process.exit(1);
}, 30000);

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    clearTimeout(timeout);
  });
