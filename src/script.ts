import { AI21 } from './Client';

async function main() {
    // It's better to use environment variables for API keys
    const client = new AI21(process.env.AI21_API_KEY || "your-api-key");
    
    try {
        const response = await client.chat.completions.create({
            model: "jamba-1.5-mini",
            messages: [{ role: "user", content: "Hello, how are you? tell me a 100 line story about a cat" }],
            stream: true
        });
        // console.log(response);
        for await (const chunk of response) {
            // console.log(chunk);
            process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);