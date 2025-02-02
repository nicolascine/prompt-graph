import { describe, it, expect } from 'vitest'
import { PromptGraph } from '../src/graph'
import { createTemplateNode, createTransformNode } from '../src/node'
import { createEdge } from '../src/edge'
import { GraphExecutor } from '../src/executor'
import { topologicalSort, detectCycle } from '../src/utils'
import { interpolate, extractVariables } from '../src/templates'

describe('PromptGraph', () => {
  it('should add nodes and edges', () => {
    const g = new PromptGraph()
    g.addNode(createTemplateNode('a', 'hello {{name}}'))
    g.addNode(createTemplateNode('b', 'bye {{name}}'))
    g.addEdge(createEdge('a', 'b'))

    expect(g.getAllNodes()).toHaveLength(2)
    expect(g.getAllEdges()).toHaveLength(1)
  })

  it('should reject duplicate node ids', () => {
    const g = new PromptGraph()
    g.addNode(createTemplateNode('a', 'test'))
    expect(() => g.addNode(createTemplateNode('a', 'test2'))).toThrow()
  })

  it('should detect potential cycles', () => {
    const g = new PromptGraph()
    g.addNode(createTemplateNode('a', ''))
    g.addNode(createTemplateNode('b', ''))
    g.addEdge(createEdge('a', 'b'))

    expect(g.wouldCreateCycle('b', 'a')).toBe(true)
    expect(g.wouldCreateCycle('a', 'b')).toBe(false)
  })
})

describe('topologicalSort', () => {
  it('should return nodes in correct order', () => {
    const g = new PromptGraph()
    g.addNode(createTemplateNode('c', ''))
    g.addNode(createTemplateNode('a', ''))
    g.addNode(createTemplateNode('b', ''))
    g.addEdge(createEdge('a', 'b'))
    g.addEdge(createEdge('b', 'c'))

    const sorted = topologicalSort(g)
    expect(sorted.indexOf('a')).toBeLessThan(sorted.indexOf('b'))
    expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('c'))
  })
})

describe('interpolate', () => {
  it('should replace variables', () => {
    expect(interpolate('hello {{name}}', { name: 'world' })).toBe('hello world')
  })

  it('should use defaults', () => {
    expect(interpolate('hello {{name | stranger}}', {})).toBe('hello stranger')
  })

  it('should leave unresolved placeholders', () => {
    expect(interpolate('{{missing}}', {})).toBe('{{missing}}')
  })
})

describe('extractVariables', () => {
  it('should find all variables', () => {
    const vars = extractVariables('{{a}} and {{b}} and {{a}}')
    expect(vars).toEqual(['a', 'b'])
  })
})

describe('GraphExecutor', () => {
  it('should execute a simple chain', async () => {
    const g = new PromptGraph()
    g.addNode(createTemplateNode('greet', 'Hello {{name}}!'))
    g.addNode(createTransformNode('upper', (input) => ({
      result: (input.prompt as string).toUpperCase()
    })))
    g.addEdge(createEdge('greet', 'upper'))
    g.setEntry('greet')

    const executor = new GraphExecutor(g)
    const results = await executor.execute({ name: 'Nico' })

    expect(results).toHaveLength(2)
    expect(results[0].prompt).toBe('Hello Nico!')
    expect(results[1].output.result).toBe('HELLO NICO!')
  })
})
