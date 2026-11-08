const path = require('path')

// eslint-config-airbnb-base is a dependency of eslint-config-airbnb, so resolve it from there (pnpm does not hoist it)
const airbnbImports = require.resolve('eslint-config-airbnb-base/rules/imports', {
  paths: [path.dirname(require.resolve('eslint-config-airbnb/package.json'))],
})
const [, airbnbExtraneousOptions] = require(airbnbImports).rules['import/no-extraneous-dependencies']

module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb',
    'plugin:react/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
  ],
  rules: {
    semi: ['error', 'never'],
    'import/order': ['error', { alphabetize: { order: 'asc' } }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  overrides: [{
    // src/package.json only marks src as ESM for node:test; dependencies live in the root one.
    // Keep airbnb's options (where devDependencies are allowed) and change packageDir.
    files: ['src/**'],
    rules: {
      'import/no-extraneous-dependencies': ['error', {
        ...airbnbExtraneousOptions,
        // airbnb's test globs only cover .js/.jsx
        devDependencies: [...airbnbExtraneousOptions.devDependencies, '**/*.test.{ts,tsx}'],
        packageDir: __dirname,
      }],
    },
  }],
}
