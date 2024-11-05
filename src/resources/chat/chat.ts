import { APIResource } from "../../resource";
import { Completions } from "./completions";


export class Chat extends APIResource {
    completions: Completions = new Completions(this._client);
}


export type ChatModel =
| "jamba-1.5-mini"
| "jamba-1.5-large"
