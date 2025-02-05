# prompt-graph

Compose LLM prompts as directed acyclic graphs.

## Motivation

Prompt engineering gets messy fast. You start with a simple template, then add context injection, then conditional routing, then transforms between steps... before you know it you have spaghetti string concatenation everywhere.

prompt-graph treats prompt composition as a data flow problem. Each step is a node in a DAG, data flows through edges, and the executor handles orchestration.

Heavily influenced by functional programming patterns and dataflow architectures.

## Install

```bash
npm install prompt-graph
```

## Quick start

```typescript
import { PromptGraph, createTemplateNode, createEdge, GraphExecutor } from 'prompt-graph'

const graph = new PromptGraph()

graph.addNode(createTemplateNode('system', 'You are a {{role}}. {{instructions}}'))
graph.addNode(createTemplateNode('user', '{{system_prompt}}\n\nUser: {{question}}'))

graph.addEdge(createEdge('system', 'user', {
  mapFn: (data) => ({ system_prompt: data.prompt, question: data.question })
}))
graph.setEntry('system')

const executor = new GraphExecutor(graph)
const results = await executor.execute({
  role: 'helpful assistant',
  instructions: 'Be concise.',
  question: 'What is a DAG?'
})
```

## Node types

- **Template**: String interpolation with `{{variable}}` syntax
- **Transform**: Custom function that transforms data between nodes
- **Conditional**: Routes to different branches based on input

## Features

- Cycle detection
- Topological sort execution
- Default values in templates (`{{var | default}}`)
- Edge-level data mapping
- Execution hooks for logging/debugging

## Why a DAG?

Because prompt chains are just a special case of a DAG (a linear one). But real-world prompt workflows have branching, merging, and conditional logic. A DAG models all of these naturally.

Also - having an explicit graph means you can visualize it, validate it, and test individual nodes in isolation.

## TODO

- [ ] Parallel node execution where possible
- [ ] Serialize/deserialize graphs to JSON
- [ ] Visual graph editor (web UI)
- [ ] Built-in retry/fallback nodes

## License

MIT
