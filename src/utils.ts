import { PromptGraph } from './graph'

/**
 * topological sort using kahn's algorithm
 * returns nodes in execution order
 */
export function topologicalSort(graph: PromptGraph): string[] {
  const nodes = graph.getAllNodes()
  const edges = graph.getAllEdges()

  // calculate in-degree for each node
  const inDegree = new Map<string, number>()
  for (const node of nodes) {
    inDegree.set(node.id, 0)
  }
  for (const edge of edges) {
    inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1)
  }

  // start with nodes that have no incoming edges
  const queue: string[] = []
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id)
  }

  const sorted: string[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    sorted.push(current)

    for (const edge of graph.getEdgesFrom(current)) {
      const newDegree = (inDegree.get(edge.to) || 0) - 1
      inDegree.set(edge.to, newDegree)
      if (newDegree === 0) {
        queue.push(edge.to)
      }
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error('Graph has a cycle - cannot sort topologically')
  }

  return sorted
}

/**
 * detect cycles in the graph
 * returns the first cycle found, or null
 */
export function detectCycle(graph: PromptGraph): string[] | null {
  const nodes = graph.getAllNodes()
  const visited = new Set<string>()
  const stack = new Set<string>()
  const path: string[] = []

  function dfs(nodeId: string): string[] | null {
    visited.add(nodeId)
    stack.add(nodeId)
    path.push(nodeId)

    for (const edge of graph.getEdgesFrom(nodeId)) {
      if (!visited.has(edge.to)) {
        const cycle = dfs(edge.to)
        if (cycle) return cycle
      } else if (stack.has(edge.to)) {
        // found a cycle
        const cycleStart = path.indexOf(edge.to)
        return [...path.slice(cycleStart), edge.to]
      }
    }

    stack.delete(nodeId)
    path.pop()
    return null
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      const cycle = dfs(node.id)
      if (cycle) return cycle
    }
  }

  return null
}
