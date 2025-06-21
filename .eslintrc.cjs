module.exports = {
  root: true,
  env: {
    es2024: true,
    node: true
  },
  extends: [
    'airbnb-base',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    'consistent-return': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'import/extensions': ['error', 'ignorePackages']
  }
};