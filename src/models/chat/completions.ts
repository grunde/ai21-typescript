export interface ChatCompletionCreateParamsBase {
    model: string;
    messages: ChatMessageParam[];
    max_tokens?: number | null;
    temperature?: number | null;
    top_p?: number | null;
    stop?: string | string[] | null;
    n?: number | null;
    stream?: boolean | null;
    tools?: ToolDefinition[] | null;
    response_format?: ResponseFormat | null;
    documents?: DocumentSchema[] | null;
    [key: string]: any;
}


export interface ChatCompletionCreateParamsNonStreaming extends ChatCompletionCreateParamsBase {
    stream?: false | null;
}

export interface ChatCompletionCreateParamsStreaming extends ChatCompletionCreateParamsBase {
    stream: true;
}

export interface ChatCompletion {
    
}

export type ChatCompletionCreateParams = ChatCompletionCreateParamsNonStreaming | ChatCompletionCreateParamsStreaming;

export interface ChatMessage {
    role: string;
    content: string;
}

export interface AssistantMessage extends ChatMessage {
    role: "assistant";
    content: string;
    tool_calls?: ToolCall[];
}

export interface ToolMessage extends ChatMessage {
    role: "tool";
    tool_call_id: string;
}

export interface UserMessage extends ChatMessage {
    role: "user";
}

export interface SystemMessage extends ChatMessage {
    role: "system";
}

export type ChatMessageParam = UserMessage | AssistantMessage | ToolMessage | SystemMessage | ChatMessage;

export interface ToolDefinition {
    type: "function";
    function: FunctionToolDefinition;
}

export interface ResponseFormat {
    type: "text" | "json_object";
}

export interface DocumentSchema {
    content: string;
    id?: string;
    metadata?: Record<string, string>;
}

export interface FunctionToolDefinition {
    name: string;
    description?: string;
    parameters: ToolParameters;
}

export interface ToolFunction {
    name: string;
    arguments: string;
}

export interface ToolParameters {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
}

export interface ToolCall {
    id: string;
    function: ToolFunction;
    type: "function";
}


// Response
export interface TopTokenData {
    token: string;
    logprob: number;
}

export interface LogprobsData {
    token: string;
    logprob: number;
    top_logprobs: TopTokenData[];
}

export interface Logprobs {
    content: LogprobsData;
}

export interface ChatCompletionResponseChoice {
    index: number;
    message: AssistantMessage;
    logprobs?: Logprobs;
    finish_reason?: string;
}

export interface ChatCompletionResponse {
    id: string;
    choices: ChatCompletionResponseChoice[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
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

export interface ChatCompletionChunk {
    id: string;
    choices: ChoicesChunk[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export declare namespace ChatCompletions {
    export {
        type ChatCompletionCreateParams,
        type ChatCompletionCreateParamsNonStreaming,
        type ChatCompletionCreateParamsStreaming,
        type ChatMessage,
        type AssistantMessage,
        type ToolMessage,
        type UserMessage,
        type SystemMessage,
        type ChatMessageParam,
        type ToolDefinition,
        type ResponseFormat,
        type DocumentSchema,
        type FunctionToolDefinition,
        type ToolFunction,
        type ToolParameters,
        type ToolCall,
        type ChatCompletionResponseChoice,
        type ChatCompletionResponse,
        type TopTokenData,
        type LogprobsData,
        type Logprobs,
        type ChoiceDelta,
        type ChoicesChunk,
        type ChatCompletionChunk,
    }
}