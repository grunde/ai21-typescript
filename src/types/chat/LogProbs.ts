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
