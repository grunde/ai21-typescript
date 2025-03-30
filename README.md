<h1 align="center">
    <a href="https://github.com/AI21Labs/ai21-typescript">AI21 Labs TypeScript SDK</a>
</h1>

<p align="center">
<a href="https://github.com/AI21Labs/ai21-typescript/actions/workflows/unittests.yml"><img src="https://github.com/AI21Labs/ai21-typescript/actions/workflows/unittests.yml/badge.svg?branch=main" alt="Test"></a>
<a href="https://github.com/AI21Labs/ai21-typescript/actions/workflows/integration-tests.yml"><img src="https://github.com/AI21Labs/ai21-typescript/actions/workflows/integration-tests.yml/badge.svg?branch=main" alt="Integration Tests"></a>
<a href="https://www.npmjs.com/package/ai21" target="_blank"><img src="https://img.shields.io/npm/v/ai21?color=%2334D058&label=npm%20package" alt="Package version"></a>
<a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/node->=18.0.0-brightgreen" alt="Supported Node.js versions"></a>
<a href="https://github.com/semantic-release/semantic-release" target="_blank"><img src="https://img.shields.io/badge/semantic--release-typescript-e10079?logo=semantic-release" alt="Semantic Release Support"></a>
<a href="https://opensource.org/licenses/Apache-2.0" target="_blank"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License"></a>
</p>

The AI21 API Client is a TypeScript library that provides a convenient interface for interacting with the AI21 API. It abstracts away the low-level details of making API requests and handling responses, allowing developers to focus on building their applications.

- [Installation](#Installation) 💿
- [Examples](#examples-tldr) 🗂️
- [AI21 Official Documentation](#Documentation)
- [Chat](#Chat)
- [Conversational RAG (Beta)](#Conversational-RAG)
- [Files](#Files)


## Environment Support

This client supports both Node.js and browser environments:

- **Node.js**: Works out of the box with Node.js >=18.0.0
- **Browser**: Requires explicit opt-in by setting `dangerouslyAllowBrowser: true` in the client options

```typescript
// Browser usage example
const client = new AI21({
  apiKey: process.env.AI21_API_KEY, // or pass it in directly
  dangerouslyAllowBrowser: true  // Required for browser environments
});
```

> ⚠️ **Security Notice**: Using this client in the browser could expose your API key to end users. Only enable `dangerouslyAllowBrowser` if you understand the security implications and have implemented appropriate security measures.

## Installation

You can install the AI21 API Client using npm or yarn:

```bash
npm install ai21
```

or

```bash
yarn add ai21
```

## Examples (tl;dr)

If you want to quickly get a glance how to use the AI21 Typescript SDK and jump straight to business, you can check out the examples. Take a look at our models and see them in action! Several examples and demonstrations have been put together to show our models' functionality and capabilities.

### [Check out the Examples](examples/)

Feel free to dive in, experiment, and adapt these examples to suit your needs. We believe they'll help you get up and running quickly.

## Documentation

The full documentation for the REST API can be found on [docs.ai21.com](https://docs.ai21.com/).


## Chat

To use the AI21 API Client, you'll need to have an API key. You can obtain an API key by signing up for an account on the AI21 website.

The `AI21` class provides a `chat` property that gives you access to the Chat API. You can use this to generate text, complete prompts, and more.

Here's an example of how to use the `AI21` class to interact with the API:

```typescript
import { AI21 } from 'ai21';

const client = new AI21({
  apiKey: process.env.AI21_API_KEY, // or pass it in directly
});

const response = await client.chat.completions.create({
  model: 'jamba-mini',
  messages: [{ role: 'user', content: 'Hello, how are you? tell me a 100 line story about a cat named "Fluffy"' }],
});

console.log(response);
```

### Streaming Responses

The client supports streaming responses for real-time processing. Here are examples using different approaches:

#### Using Async Iterator

```typescript
const streamResponse = await client.chat.completions.create({
  model: 'jamba-mini',
  messages: [{ role: 'user', content: 'Write a story about a space cat' }],
  stream: true,
});

for await (const chunk of streamResponse) {
  console.log(chunk.choices[0]?.delta?.content || '');
}
```
---
### Files


The `AI21` class provides a `files` property that gives you access to the Files API. You can use it to upload, retrieve, update, list, and delete files.


```typescript
import { AI21 } from 'ai21';

const client = new AI21({
  apiKey: process.env.AI21_API_KEY, // or pass it in directly
});

const fileUploadResponse = await client.files.create({
 file: './articles/article1.pdf',
 labels: ['science', 'biology'],
 path: 'virtual-path/to/science-articles',
});


const file = await client.files.get(fileUploadResponse.fileId);

```

---
### Conversational-RAG


The `AI21` class provides a `conversationalRag` property that gives you access to the Conversational RAG API. You can use it to ask questions that are answered based on the files you uploaded.


```typescript
import { AI21 } from 'ai21';

const client = new AI21({
  apiKey: process.env.AI21_API_KEY, // or pass it in directly
});

const convRagResponse = await client.conversationalRag.create({
     messages: [{ role: 'user', content: 'This question presumes that the answer can be found within the uploaded files.' }],
   });

```


## Configuration

The `AI21` class accepts several configuration options, which you can pass in when creating a new instance:

- `baseURL`: The base URL for the API endpoint (default: `https://api.ai21.com/studio/v1`)
- `apiKey`: Your AI21 API Key
- `maxRetries`: The maximum number of retries for failed requests (default: `3`)
- `timeout`: The request timeout in seconds
- `dangerouslyAllowBrowser`: Set to `true` to allow the client to be used in a browser environment.

## API Reference

For detailed information about the available methods and their parameters, please refer to the [API reference documentation](https://docs.ai21.com/docs).

## Contributing

If you encounter any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/AI21Labs/ai21-typescript).

## License

This library is licensed under the [Apache-2.0 License](LICENSE).
