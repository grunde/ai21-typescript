import { ToolFunction } from "./ToolFunction";

export interface ToolCall {
    id: string;
    function: ToolFunction;
    type: "function";
}

export declare namespace ChatCompletions {
    export {
        type ToolCall,
    }
}