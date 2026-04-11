// eslint.config.js
import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import unocss from '@unocss/eslint-config/flat'
import pluginVitest from '@vitest/eslint-plugin'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
// @ts-expect-error - eslint-plugin-cypress缺少类型定义
import pluginCypress from 'eslint-plugin-cypress'
import pluginOxlint from 'eslint-plugin-oxlint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

// 自定义自动导入全局变量
import customGlobals from './.eslintrc-auto-import.json' assert { type: 'json' }

export default defineConfigWithVueTs(
  unocss,
  {
    name: 'project/files',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  // =========================
  // 忽略目录和文件
  // =========================
  globalIgnores([
    '**/dist/**',
    '**/coverage/**',
    'node_modules/**',
    'public/**',
    '*.css',
    '*.jpg',
    '*.jpeg',
    '*.png',
    '*.gif',
    '*.d.ts',
  ]),

  // =========================
  // 官方推荐规则
  // =========================
  eslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  ...pluginOxlint.configs['flat/recommended'],

  // =========================
  // Stylistic 风格
  // =========================
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: true,
    braceStyle: '1tbs',
    arrowParens: true,
  }),

  // =========================
  // 自定义 TypeScript 规则
  // =========================
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true, argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-function': ['warn', { allow: ['arrowFunctions', 'methods'] }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': false,
          'ts-check': false,
        },
      ],
      // 强制类型导入
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },

  // =========================
  // Vue 自定义规则
  // =========================
  {
    rules: {
      'vue/no-mutating-props': ['error', { shallowOnly: true }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
      'vue/multi-word-component-names': 'off',
      // 'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },

  // =========================
  // 全局变量
  // =========================
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...customGlobals.globals,
        wx: true,
      },
    },
  },

  // =========================
  // 测试环境
  // =========================
  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
  },

  // =========================
  // Import 排序 & 未使用的 Import
  // =========================
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-duplicate-imports': 'off',
      'sort-imports': 'off', // 官方 sort-imports 可关闭
    },
  },
  {
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
    },
  },

  // =========================
  // Prettier
  // =========================
  eslintPluginPrettierRecommended,
)
