import { Logprobs } from './LogProbs';
import { AssistantMessage } from './ChatMessage';

export interface ChatCompletionResponse {
  id: string;
  choices: ChatCompletionResponseChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatCompletionResponseChoice {
  index: number;
  message: AssistantMessage;
  logprobs?: Logprobs;
  finish_reason?: string;
}

// Streaming
export interface ChatCompletionChunk {
  id: string;
  choices: ChoicesChunk[];
  usage?: UsageInfo;
}

export interface ChoiceDelta {
  content?: string;
  role?: string;
}

export interface ChoicesChunk {
  index: number;
  delta: ChoiceDelta;
  logprobs?: Logprobs;
  finish_reason?: string;
}

export interface UsageInfo {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export declare namespace ChatCompletions {
  export {
    type ChatCompletionResponseChoice,
    type ChatCompletionResponse,
    type ChoiceDelta,
    type ChoicesChunk,
    type ChatCompletionChunk,
    type UsageInfo,
  };
}
