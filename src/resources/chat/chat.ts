import { APIResource } from '../../APIResource';
import { Completions } from './Completions';

export class Chat extends APIResource {
  completions: Completions = new Completions(this._client);
}
