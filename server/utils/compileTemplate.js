const compileTemplate = (template, data) => {
    return template.replace(
        /\{(.*?)\}/g,
        (_, key) => {
            const value = data[key.trim()];
            return value ?? ''
        }
    )
}

module.exports = compileTemplate