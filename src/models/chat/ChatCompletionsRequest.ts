import { DocumentSchema } from "./DocumentSchema";
import { ToolDefinition } from "./ToolDefinition";
import { ChatMessageParam } from "./ChatMessage";
import { ResponseFormat } from "./ResponseFormat";
import { ChatModel } from "./ChatModel";

export interface ChatCompletionCreateParamsBase {
    model: ChatModel;
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

export type ChatCompletionCreateParams = ChatCompletionCreateParamsNonStreaming | ChatCompletionCreateParamsStreaming;


export declare namespace ChatCompletions {
    export {
        type ChatCompletionCreateParams,
        type ChatCompletionCreateParamsNonStreaming,
        type ChatCompletionCreateParamsStreaming,
    }
}