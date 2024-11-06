import { DEFAULT_TIMEOUT } from "./Constants";

import { STUDIO_BASE_URL } from "./Constants";

export class AI21EnvConfig {
    static readonly API_KEY = process.env.AI21_API_KEY ?? '';
    static readonly BASE_URL = process.env.AI21_BASE_URL ?? STUDIO_BASE_URL;
    static readonly TIMEOUT_SECONDS = process.env.AI21_TIMEOUT_SECONDS ? 
        Number(process.env.AI21_TIMEOUT_SECONDS) : 
        DEFAULT_TIMEOUT;
    static readonly MAX_RETRIES = process.env.AI21_MAX_RETRIES ? 
        Number(process.env.AI21_MAX_RETRIES) : 
        3;
    static readonly LOG_LEVEL = process.env.AI21_LOG_LEVEL ?? 'info';
}
