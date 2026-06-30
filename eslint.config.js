// ESLint - eslint.config.js

/**
 * Targeted Control Architecture
 *
 * ├── Base JavaScript
 * ├── Base TypeScript
 * ├── Angular (*.ts)
 * ├── Angular HTML
 * ├── Tests (*.spec.ts)
 * ├── Sonar
 * ├── Unicorn
 * ├── Import
 * ├── Unused Imports
 * ├── Stylistic (remplace partiellement Prettier pour les règles de style)
 * └── Prettier (pour la compatibilité finale)
 */

import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
// NOUVEAU : @stylistic pour remplacer les règles de style de Prettier (Config 2)
import stylistic from '@stylistic/eslint-plugin';
// Conservé pour la compatibilité avec Prettier (Config 1)
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  {
    plugins: {
      sonarjs,
      unicorn,
      'unused-imports': unusedImports,
      import: importPlugin,
      prettier: eslintPluginPrettier,
      '@stylistic': stylistic,
    },
  },

  // Configuration JavaScript
  js.configs.recommended,

  // Configuration TypeScript
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  // Configuration Angular TS
  ...angular.configs.tsRecommended,

  {
    files: ['**/*.ts'],
    processor: angular.processInlineTemplates,

    rules: {
      // --- Règles TypeScript ---
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',

      // --- Règles Angular ---
      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],

      // --- Règles Imports ---
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
          },
          'newlines-between': 'always',
        },
      ],
      // Désactivation des règles natives au profit de unused-imports
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // --- Règles Sonar ---
      'sonarjs/cognitive-complexity': ['warn', 15],

      // --- Règles Générales ---
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      curly: 'error',

      // --- Règles Stylistiques ---
      // Remplace les règles équivalentes de Prettier pour éviter les conflits
      '@stylistic/brace-style': ['error', 'allman', { allowSingleLine: true }],
      '@stylistic/indent': ['error', 4],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/max-len': ['error', { code: 120 }],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single'],
      // Règles commentées de Config 2 (optionnelles, à activer si besoin)
      // '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
      // '@stylistic/newline-per-chained-call': ['error', { ignoreChainWithDepth: 2 }],
      // '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      // '@stylistic/object-curly-newline': [
      //   'error',
      //   {
      //     ImportDeclaration: { multiline: true, minProperties: 4, consistent: false },
      //     ExportDeclaration: { multiline: true, minProperties: 4, consistent: false },
      //     ObjectExpression: { multiline: true, consistent: true },
      //     ObjectPattern: { multiline: true, consistent: true },
      //   },
      // ],
      // '@stylistic/object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }],

      // --- Prettier ---
      // Conservé pour la compatibilité, mais les règles stylistiques sont gérées par @stylistic
      'prettier/prettier': 'error',
    },
  },

  // Configuration Angular HTML
  ...angular.configs.templateRecommended,
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-any': 'warn',
      '@angular-eslint/template/eqeqeq': 'error',
      // Option pour l'accessibilité
      // ...angular.configs.templateAccessibility,
    },
  },

  // IMPORTANT : doit rester en dernière position
  // eslint-config-prettier désactive les règles de style ESLint en conflit avec Prettier
  // Mais @stylistic est déjà utilisé pour les règles de style, donc Prettier est ici en backup
  eslintConfigPrettier,
]);
