import { AI21 } from 'ai21';

async function main() {
  const client = new AI21({ apiKey: process.env.AI21_API_KEY });

  try {
    const streamResponse = await client.chat.completions.create({
      model: 'jamba-1.5-mini',
      messages: [{ role: 'user', content: 'Hello, how are you? tell me a 100 line story about a cat' }],
      stream: true,
    });

    console.log('Stream response type:', typeof streamResponse);
    console.log('Stream response structure:', JSON.stringify(streamResponse, null, 2));

    if (!streamResponse) {
      throw new Error('No response received from API');
    }

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
