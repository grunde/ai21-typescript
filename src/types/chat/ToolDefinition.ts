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
  properties: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  required?: string[];
}
