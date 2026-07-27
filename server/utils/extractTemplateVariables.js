const extractTemplateVariables = (content = '') => {
    const matches = content.match(/\{([^}]+)\}/g) || []
    const variables = matches.map((match) => match.slice(1, -1).trim()).filter(Boolean)
    return [...new Set(variables)]
}

module.exports = extractTemplateVariables
