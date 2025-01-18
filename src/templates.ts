/**
 * simple template engine for prompt templates
 * supports {{variable}} and {{variable | default}} syntax
 */
export function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)(?:\s*\|\s*(.+?))?\}\}/g, (match, key, defaultVal) => {
    const value = variables[key]
    if (value === undefined || value === null) {
      if (defaultVal !== undefined) return defaultVal.trim()
      // leave placeholder if no value and no default
      // this is intentional - helps debugging missing variables
      return match
    }
    return String(value)
  })
}

/**
 * extract variable names from a template
 */
export function extractVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)(?:\s*\|.*?)?\}\}/g)
  const vars = new Set<string>()
  for (const match of matches) {
    vars.add(match[1])
  }
  return Array.from(vars)
}

/**
 * validate that all required variables are provided
 */
export function validateVariables(template: string, variables: Record<string, any>): { missing: string[], extra: string[] } {
  const required = extractVariables(template)
  const provided = Object.keys(variables)

  const missing = required.filter(v => !(v in variables))
  const extra = provided.filter(v => !required.includes(v))

  return { missing, extra }
}
