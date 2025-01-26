import { PromptGraph } from './graph'
import { PromptNode } from './node'
import { interpolate } from './templates'
import { topologicalSort } from './utils'

export interface ExecutionResult {
  nodeId: string
  output: Record<string, any>
  prompt?: string  // resolved prompt for template nodes
}

export interface ExecutorOptions {
  // callback for each node execution (useful for logging/debugging)
  onNodeExecute?: (nodeId: string, input: Record<string, any>) => void
  // max execution time per node in ms
  timeout?: number
}

export class GraphExecutor {
  private graph: PromptGraph
  private options: ExecutorOptions

  constructor(graph: PromptGraph, options: ExecutorOptions = {}) {
    this.graph = graph
    this.options = options
  }

  async execute(input: Record<string, any>): Promise<ExecutionResult[]> {
    const order = topologicalSort(this.graph)
    const results: ExecutionResult[] = []
    const nodeOutputs = new Map<string, Record<string, any>>()

    // entry node gets the initial input
    const entryNode = this.graph.getEntryNode()
    if (!entryNode) {
      throw new Error('No entry node set')
    }

    for (const nodeId of order) {
      const node = this.graph.getNode(nodeId)!

      // gather inputs from parent nodes
      let nodeInput: Record<string, any> = {}
      if (nodeId === entryNode.id) {
        nodeInput = { ...input }
      } else {
        // merge outputs from all parent edges
        const parentEdges = this.graph.getAllEdges().filter(e => e.to === nodeId)
        for (const edge of parentEdges) {
          const parentOutput = nodeOutputs.get(edge.from) || {}
          const mapped = edge.mapFn ? edge.mapFn(parentOutput) : parentOutput
          nodeInput = { ...nodeInput, ...mapped }
        }
      }

      this.options.onNodeExecute?.(nodeId, nodeInput)

      const result = await this.executeNode(node, nodeInput)
      results.push(result)
      nodeOutputs.set(nodeId, result.output)
    }

    return results
  }

  private async executeNode(node: PromptNode, input: Record<string, any>): Promise<ExecutionResult> {
    switch (node.type) {
      case 'template': {
        const prompt = interpolate(node.template!, input)
        return {
          nodeId: node.id,
          output: { ...input, prompt },
          prompt,
        }
      }

      case 'transform': {
        const output = await node.transform!(input)
        return {
          nodeId: node.id,
          output,
        }
      }

      case 'conditional': {
        const branch = node.condition!(input)
        // find the edge with matching label
        const edges = this.graph.getEdgesFrom(node.id)
        const matchingEdge = edges.find(e => e.label === branch)
        if (!matchingEdge) {
          throw new Error(`No edge found for condition result "${branch}" from node "${node.id}"`)
        }
        return {
          nodeId: node.id,
          output: { ...input, _branch: branch },
        }
      }

      default:
        throw new Error(`Unknown node type: ${node.type}`)
    }
  }
}
