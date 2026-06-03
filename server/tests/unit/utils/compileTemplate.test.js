const compileTemplate = require('../../../utils/compileTemplate')

describe('compileTemplate', () => {
    test('should replace placeholders with data values', () => {
        const template = 'Hello {name}, your email is {email}';
        const data = { name: 'John', email: 'john@example.com' };
        const result = compileTemplate(template, data);
        expect(result).toBe('Hello John, your email is john@example.com');
    });

    test('should replace missing values with empty string', () => {
        const template = 'name: {name}, email: {email}'
        const data = { name: 'Alice' }
        const result = compileTemplate(template, data)
        expect(result).toBe('name: Alice, email: ')
    })

    test('should return original string if no placeholders are provided', () => {
        const template = 'Hello World';
        const data = { name: 'Alice'}
        const result = compileTemplate(template, data)
        expect(result).toBe('Hello World')
    })

    test('should igonore extra fields', () => {
        const template = 'Hey there {name}, how are you?'
        const data = { name: 'John', age: 23, company: 'xyz', address: 'fake street 123'}
        const result = compileTemplate(template, data)
        expect(result).toBe('Hey there John, how are you?')
    })
    
    test('should handle undefined and null values safely', () => {
        const template = 'hello {name}'
        const data = { name: null}
        const result = compileTemplate(template, data)
        expect(result).toBe('hello ')
    })
});