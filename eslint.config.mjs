import tsParser from '@typescript-eslint/parser';
import { node as canonicalNodeConfig } from 'eslint-config-canonical';
import canonicalAutoConfig from 'eslint-config-canonical/auto';

export const commonRules = {
  // We don't care about the filename matching the exported name
  'canonical/filename-match-exported': 'off',
  // We don't care about the filename matching the regex
  'canonical/filename-match-regex': 'off',
  // Modify canonical id-match to allow underscore prefixed variables
  'canonical/id-match': [
    'error',
    '(^[A-Za-z_]+(?:\\d*(?:[A-Z][a-z]*)*)+$)|(^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$)|(^(_|\\$)$)',
  ],
  // Allow extensions in TypeScript files (ESM requirement)
  'import/extensions': ['error', 'always', { ignorePackages: true }],
  'import/no-useless-path-segments': [
    'error',
    {
      noUselessIndex: false,
    },
  ],
  'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
  // labels are actually useful
  'no-labels': 'off',
  // We use warning comments to flag areas of the code that need to be addressed
  'no-warning-comments': 'off',
  'perfectionist/sort-exports': [
    'error',
    {
      newlinesBetween: 'always',
      order: 'asc',
      partitionByComment: true,
      partitionByNewLine: false,
      specialCharacters: 'keep',
      type: 'natural',
    },
  ],
  'perfectionist/sort-imports': [
    'error',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling', 'index'],
        'unknown',
      ],
      internalPattern: ['^@(core|shared|features|pages|components)/.+'],
      newlinesBetween: 'always',
      order: 'asc',
      partitionByComment: true,
      partitionByNewLine: false,
      specialCharacters: 'keep',
      tsconfigRootDir: '.',
      type: 'natural',
    },
  ],
  'perfectionist/sort-interfaces': [
    'error',
    {
      order: 'asc',
      partitionByNewLine: true,
      type: 'natural',
    },
  ],
  'perfectionist/sort-modules': [
    'error',
    {
      customGroups: [],
      groups: [
        'declare-enum',
        'export-enum',
        'enum',
        ['declare-interface', 'declare-type'],
        ['export-interface', 'export-type'],
        ['interface', 'type'],
        'declare-class',
        'class',
        'export-class',
        'declare-function',
        'export-function',
        'function',
      ],
      ignoreCase: true,
      newlinesBetween: 'ignore',
      order: 'asc',
      partitionByComment: true,
      partitionByNewLine: true,
      specialCharacters: 'keep',
      type: 'natural',
    },
  ],
  'perfectionist/sort-object-types': [
    'error',
    {
      partitionByComment: true,
      partitionByNewLine: true,
      type: 'natural',
    },
  ],
  'perfectionist/sort-objects': [
    'error',
    {
      partitionByComment: true,
      partitionByNewLine: true,
      type: 'natural',
    },
  ],
  'perfectionist/sort-union-types': [
    'error',
    {
      groups: [
        'conditional',
        'function',
        'import',
        'intersection',
        'literal',
        'named',
        'object',
        'operator',
        'tuple',
        'union',
        'keyword',
        'nullish',
      ],
      ignoreCase: true,
      newlinesBetween: 'ignore',
      order: 'asc',
      partitionByComment: true,
      partitionByNewLine: true,
      specialCharacters: 'keep',
      type: 'alphabetical',
    },
  ],
  'unicorn/prevent-abbreviations': 'off',
  // Useless and create false-positives on any method called `postMessage`
  'unicorn/require-post-message-target-origin': 'off',
};

export default [
  // Global ignores - must be in a separate config object with no other properties
  {
    ignores: [
      '.pnpm-store/**',
      'node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.angular/**',
      '**/playwright-report/**',
      'packages/db/src/schemas/generated/**',
      '**/tsconfig.tsbuildinfo',
      '**/*.dump',
      '**/*.log',
    ],
  },
  ...canonicalAutoConfig,
  ...canonicalNodeConfig.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.js', '**/*.cjs', '**/*.mjs'],
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },
    rules: {
      ...commonRules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
    rules: {
      ...commonRules,
    },
  },
  {
    files: ['**/*.json', '**/*.jsonc'],
    rules: {
      'jsonc/sort-keys': [
        'error',
        {
          allowLineSeparatedGroups: true,
          hasProperties: ['type'],
          order: [
            'type',
            'properties',
            'items',
            'required',
            'minItems',
            'additionalProperties',
            'additionalItems',
          ],
          pathPattern: '.*',
        },
      ],
    },
  },
];
