import * as Core from '../../Core';
import * as Models from '../../models';
import { APIResource } from "../../resource";
import { Stream } from '../../Streaming';


export class Completions extends APIResource {
    create(
        body: Models.ChatCompletionCreateParamsNonStreaming,
        options?: Core.RequestOptions,
      ): Core.APIPromise<Models.ChatCompletionResponse>;
    
      create(
        body: Models.ChatCompletionCreateParamsStreaming,
        options?: Core.RequestOptions,
      ): Core.APIPromise<Stream<Models.ChatCompletionChunk>>;

      create(
        body: Models.ChatCompletionCreateParams,
        options?: Core.RequestOptions,
      ): Core.APIPromise<Stream<Models.ChatCompletionChunk> | Models.ChatCompletionResponse>;

    create(body: Models.ChatCompletionCreateParams, options?: Core.RequestOptions) {
        return this._client.post<
            Models.ChatCompletionCreateParams,
            Models.ChatCompletionResponse
        >(
            "/chat/completions",
            {body, ...options, stream: body.stream ?? false} as Core.RequestOptions<Models.ChatCompletionCreateParams>
        ) as Core.APIPromise<Models.ChatCompletionResponse> | Core.APIPromise<Stream<Models.ChatCompletionChunk>>;
    }
}
