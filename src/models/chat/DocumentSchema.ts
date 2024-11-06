export interface DocumentSchema {
    content: string;
    id?: string;
    metadata?: Record<string, string>;
}

export declare namespace ChatCompletions {
    export {
        type DocumentSchema,
    }
}