import { ToolFunction } from './ToolFunction';

export interface ToolCall {
  id: string;
  function: ToolFunction;
  type: 'function';
}
