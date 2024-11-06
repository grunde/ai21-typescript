import { AI21 } from './Client';

async function main() {
    const client = new AI21("L40MQGXxfbtQVnCRqNTTKaojD8Snt7nQ");
    
    try {
        const response = await client.chat.completions.create({
            model: "jamba-1.5-mini",
            messages: [{ role: "user", content: "Hello, how are you? tell me a 100 line story about a cat" }],
            stream: true
        });
        for await (const chunk of response) {
            process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);