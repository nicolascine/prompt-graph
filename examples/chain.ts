import { PromptGraph } from '../src/graph'
import { createTemplateNode, createTransformNode } from '../src/node'
import { createEdge } from '../src/edge'
import { GraphExecutor } from '../src/executor'

// simple 3-step chain: context -> question -> answer format

const graph = new PromptGraph()

graph.addNode(createTemplateNode('context',
  'Given the following context:\n\n{{context}}'
))

graph.addNode(createTransformNode('combine', (input) => ({
  ...input,
  // combine context and question into a single prompt
  fullPrompt: `${input.prompt}\n\nQuestion: ${input.question}\n\nAnswer:`
})))

graph.addNode(createTemplateNode('format',
  'Please provide a concise answer.\n\n{{fullPrompt}}'
))

graph.addEdge(createEdge('context', 'combine'))
graph.addEdge(createEdge('combine', 'format'))

graph.setEntry('context')

// run it
const executor = new GraphExecutor(graph, {
  onNodeExecute: (id, input) => console.log(`executing: ${id}`),
})

const results = await executor.execute({
  context: 'TypeScript is a typed superset of JavaScript.',
  question: 'What is TypeScript?',
})

console.log('Final prompt:', results[results.length - 1].prompt)
