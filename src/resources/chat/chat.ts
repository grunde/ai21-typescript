import { APIResource } from '../../APIResource';
import { Completions } from './completions';

export class Chat extends APIResource {
  completions: Completions = new Completions(this._client);
}
