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

export declare namespace ChatCompletions {
    export {
        type Logprobs,
        type LogprobsData,
        type TopTokenData,
    }
}