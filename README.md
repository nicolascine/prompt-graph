# prompt-graph

Compose LLM prompts as directed acyclic graphs.

```
  [context] ──→ [transform] ──→ [format]
                     ↑
  [user_input] ──────┘
```

## The idea

Prompt engineering is fundamentally a **data flow** problem. You have inputs (context, user query, system instructions), you have transforms (formatting, filtering, combining), and you have outputs (the final prompt sent to the LLM).

Most codebases handle this with string concatenation. Template literals everywhere. Conditional blocks that grow and grow until nobody understands what the final prompt looks like.

prompt-graph makes the flow explicit. Each step is a **node**. Data moves through **edges**. The graph is validated, executed in topological order, and — crucially — each node can be tested in isolation.

If you've worked with dataflow programming or stream processing, this will feel familiar.

## Quick start

```typescript
import { PromptGraph, createTemplateNode, createTransformNode, createEdge, GraphExecutor } from 'prompt-graph'

const graph = new PromptGraph()

graph.addNode(createTemplateNode('system', 'You are a {{role}}. {{instructions}}'))
graph.addNode(createTransformNode('format', (input) => ({
  finalPrompt: `${input.prompt}\n\nUser: ${input.question}`
})))

graph.addEdge(createEdge('system', 'format'))
graph.setEntry('system')

const executor = new GraphExecutor(graph)
const results = await executor.execute({
  role: 'code reviewer',
  instructions: 'Be concise and direct.',
  question: 'Review this function for bugs.'
})
```

## Node types

**Template** — String interpolation with `{{variable}}` syntax. Supports defaults: `{{name | stranger}}`.

**Transform** — Arbitrary function. Takes the accumulated data, returns modified data. This is where you put business logic.

**Conditional** — Routes execution to different branches based on input. The condition function returns a label that matches an edge.

## Design decisions

**Why a DAG and not a simple chain?**
Chains are just DAGs with no branching. Real prompt workflows have conditional logic (route based on language, complexity, user type), merging (combine results from parallel paths), and shared inputs. A DAG handles all of these.

**Why not just use LangChain / LlamaIndex?**
Those are frameworks. This is a pattern. prompt-graph doesn't know anything about LLMs, APIs, or vector stores. It just composes prompts. Use it inside whatever framework you want, or use it standalone.

**Why explicit graphs instead of function composition?**
Because you can validate a graph before executing it. Cycle detection, missing variable checks, dependency analysis — all possible because the structure is data, not code.

## API

The full API is small: `PromptGraph`, `GraphExecutor`, three node constructors (`createTemplateNode`, `createTransformNode`, `createConditionalNode`), and `createEdge`. Plus utilities for `topologicalSort`, `detectCycle`, and template `interpolate`/`extractVariables`.

See the `examples/` directory for chain and branching patterns.

## License

MIT
