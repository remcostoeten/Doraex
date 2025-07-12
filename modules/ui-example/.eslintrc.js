module.exports = {
  extends: ['../../.eslintrc.json'],
  rules: {
    // Combined syntax restrictions
    'no-restricted-syntax': [
      'error',
      // Ban arrow functions
      {
        selector: 'ArrowFunctionExpression',
        message: 'Arrow functions are not allowed. Use function declarations instead.'
      },
      {
        selector: 'VariableDeclarator > ArrowFunctionExpression',
        message: 'Arrow function constants are not allowed. Use function declarations instead.'
      },
      // Ban default exports except in pages and views
      {
        selector: 'ExportDefaultDeclaration',
        message: 'Default exports are not allowed except in pages and views directories.'
      },
      // Ban classes and OOP patterns
      {
        selector: 'ClassDeclaration',
        message: 'Classes are not allowed. Use functional programming patterns.'
      },
      {
        selector: 'ClassExpression',
        message: 'Classes are not allowed. Use functional programming patterns.'
      },
      {
        selector: 'NewExpression',
        message: 'The "new" keyword is not allowed. Use functional patterns.'
      },
      {
        selector: 'ThisExpression',
        message: 'The "this" keyword is not allowed. Use functional patterns.'
      },
      // Ban interfaces
      {
        selector: 'TSInterfaceDeclaration',
        message: 'Interfaces are not allowed. Use type declarations instead.'
      }
    ],
    
    // Type naming convention will be enforced manually
    
    // Warn about comments
    'no-inline-comments': 'warn',
    'spaced-comment': ['warn', 'never']
  }
}
