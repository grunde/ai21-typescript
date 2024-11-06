export interface ToolDefinition {
  type: 'function';
  function: FunctionToolDefinition;
}

export interface FunctionToolDefinition {
  name: string;
  description?: string;
  parameters: ToolParameters;
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
}

export declare namespace ChatCompletions {
  export { type ToolDefinition, type FunctionToolDefinition, type ToolParameters };
}
