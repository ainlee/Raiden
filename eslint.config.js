import airbnb from 'eslint-config-airbnb-base';

export default [
  ...airbnb,
  {
    ignores: ['dist/**', 'coverage/**']
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-console': 'off',
      'import/prefer-default-export': 'off',
      'consistent-return': 'off',
      'no-use-before-define': ['error', { functions: false }],
      'import/extensions': ['error', 'ignorePackages']
    }
  }
];