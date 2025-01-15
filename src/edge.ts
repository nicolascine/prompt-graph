export interface Edge {
  from: string
  to: string
  // optional label for conditional routing
  label?: string
  // optional transform applied during data transfer
  mapFn?: (data: Record<string, any>) => Record<string, any>
}

export function createEdge(from: string, to: string, options?: { label?: string; mapFn?: Edge['mapFn'] }): Edge {
  return {
    from,
    to,
    label: options?.label,
    mapFn: options?.mapFn,
  }
}
