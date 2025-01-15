export type NodeType = 'template' | 'transform' | 'conditional'

export interface PromptNode {
  id: string
  type: NodeType
  // template nodes have a template string with {{variable}} placeholders
  template?: string
  // transform nodes have a function that takes input and returns output
  transform?: (input: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>
  // conditional nodes route to different edges based on a condition
  condition?: (input: Record<string, any>) => string
}

export function createTemplateNode(id: string, template: string): PromptNode {
  return { id, type: 'template', template }
}

export function createTransformNode(
  id: string,
  transform: (input: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>
): PromptNode {
  return { id, type: 'transform', transform }
}

export function createConditionalNode(
  id: string,
  condition: (input: Record<string, any>) => string
): PromptNode {
  return { id, type: 'conditional', condition }
}
