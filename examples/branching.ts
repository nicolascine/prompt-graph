import { PromptGraph } from '../src/graph'
import { createTemplateNode, createConditionalNode } from '../src/node'
import { createEdge } from '../src/edge'
import { GraphExecutor } from '../src/executor'

// branching example: route to different prompt templates based on input language

const graph = new PromptGraph()

graph.addNode(createConditionalNode('router', (input) => {
  // simple language detection (very basic)
  const text = input.text || ''
  if (/[áéíóúñ¿¡]/.test(text)) return 'spanish'
  return 'english'
}))

graph.addNode(createTemplateNode('english',
  'Please summarize the following text in English:\n\n{{text}}'
))

graph.addNode(createTemplateNode('spanish',
  'Por favor resume el siguiente texto en español:\n\n{{text}}'
))

graph.addEdge(createEdge('router', 'english', { label: 'english' }))
graph.addEdge(createEdge('router', 'spanish', { label: 'spanish' }))

graph.setEntry('router')

const executor = new GraphExecutor(graph)

// test with english
const r1 = await executor.execute({ text: 'Hello world, this is a test.' })
console.log('English route:', r1)

// test with spanish
const r2 = await executor.execute({ text: '¿Cómo estás? Este es un texto en español.' })
console.log('Spanish route:', r2)
