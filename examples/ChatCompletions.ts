import { AI21 } from "ai21";

const main = async () => {
    const client = new AI21('L40MQGXxfbtQVnCRqNTTKaojD8Snt7nQ');
    
    try {
        const response = await client.createChatCompletion([
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello, how are you?' }
        ]);
        
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();