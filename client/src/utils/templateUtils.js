export const compileTemplate = (template, data = {}) => {
  return template.replace(/\{(.*?)\}/g, (_, key) => {
    const value = data[key.trim()]
    return value ?? ''
  })
}

export const extractTemplateVariables = (content = '') => {
  const matches = content.match(/\{([^}]+)\}/g) || []
  const variables = matches.map((match) => match.slice(1, -1).trim()).filter(Boolean)
  return [...new Set(variables)]
}

export const PERSONALIZATION_FIELDS = [
  { key: 'name', label: 'Name', sample: 'Alex' },
  { key: 'username', label: 'Username', sample: 'alexsmith' },
  { key: 'email', label: 'Email', sample: 'alex@example.com' },
  { key: 'company', label: 'Company', sample: 'Acme Inc' },
]

export const buildSampleData = () =>
  PERSONALIZATION_FIELDS.reduce((acc, field) => {
    acc[field.key] = field.sample
    return acc
  }, {})
