import { ToolCall } from './ToolCall';

export interface ChatMessage {
  role: string;
  content: string;
}

export interface AssistantMessage extends ChatMessage {
  role: 'assistant';
  content: string;
  tool_calls?: ToolCall[];
}

export interface ToolMessage extends ChatMessage {
  role: 'tool';
  tool_call_id: string;
}

export interface UserMessage extends ChatMessage {
  role: 'user';
}

export interface SystemMessage extends ChatMessage {
  role: 'system';
}

export type ChatMessageParam = UserMessage | AssistantMessage | ToolMessage | SystemMessage | ChatMessage;
