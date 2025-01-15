import { PromptNode } from './node'
import { Edge } from './edge'

export class PromptGraph {
  private nodes: Map<string, PromptNode> = new Map()
  private edges: Edge[] = []
  private entryNodeId: string | null = null

  addNode(node: PromptNode): this {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with id "${node.id}" already exists`)
    }
    this.nodes.set(node.id, node)
    return this
  }

  addEdge(edge: Edge): this {
    // validate nodes exist
    if (!this.nodes.has(edge.from)) {
      throw new Error(`Source node "${edge.from}" not found`)
    }
    if (!this.nodes.has(edge.to)) {
      throw new Error(`Target node "${edge.to}" not found`)
    }
    this.edges.push(edge)
    return this
  }

  setEntry(nodeId: string): this {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Entry node "${nodeId}" not found`)
    }
    this.entryNodeId = nodeId
    return this
  }

  getNode(id: string): PromptNode | undefined {
    return this.nodes.get(id)
  }

  getEdgesFrom(nodeId: string): Edge[] {
    return this.edges.filter(e => e.from === nodeId)
  }

  getEntryNode(): PromptNode | null {
    if (!this.entryNodeId) return null
    return this.nodes.get(this.entryNodeId) || null
  }

  getAllNodes(): PromptNode[] {
    return Array.from(this.nodes.values())
  }

  getAllEdges(): Edge[] {
    return [...this.edges]
  }

  // check if adding an edge would create a cycle
  wouldCreateCycle(from: string, to: string): boolean {
    // simple DFS from 'to' to see if we can reach 'from'
    const visited = new Set<string>()
    const stack = [to]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (current === from) return true
      if (visited.has(current)) continue
      visited.add(current)

      for (const edge of this.getEdgesFrom(current)) {
        stack.push(edge.to)
      }
    }

    return false
  }
}
