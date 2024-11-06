import { APIPromise } from '../../APIPromise';
import * as Models from '../../models';
import { APIResource } from "../../APIResource";
import { Stream } from '../../Streaming';

export class Completions extends APIResource {
    create(
        body: Models.ChatCompletionCreateParamsNonStreaming,
        options?: Models.RequestOptions,
      ): APIPromise<Models.ChatCompletionResponse>;
    
      create(
        body: Models.ChatCompletionCreateParamsStreaming,
        options?: Models.RequestOptions,
      ): APIPromise<Stream<Models.ChatCompletionChunk>>;

      create(
        body: Models.ChatCompletionCreateParams,
        options?: Models.RequestOptions,
      ): APIPromise<Stream<Models.ChatCompletionChunk> | Models.ChatCompletionResponse>;

    create(body: Models.ChatCompletionCreateParams, options?: Models.RequestOptions) {
        return this._client.post<
            Models.ChatCompletionCreateParams,
            Models.ChatCompletionResponse
        >(
            "/chat/completions",
            {body, ...options, stream: body.stream ?? false} as Models.RequestOptions<Models.ChatCompletionCreateParams>
        ) as APIPromise<Models.ChatCompletionResponse> | APIPromise<Stream<Models.ChatCompletionChunk>>;
    }
}
