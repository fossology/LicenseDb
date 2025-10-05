// SPDX-License-Identifier: FSFAP
// SPDX-FileCopyrightText: © 2025 Siemens AG
// SPDX-FileContributor: Kaushlendra Pratap Singh <kaushlendra-pratap.singh@siemens.com>

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import _import from 'eslint-plugin-import';
import globals from 'globals';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	{
		extends: fixupConfigRules(
			compat.extends(
				'eslint:recommended',
				'plugin:react/recommended',
				'plugin:react-hooks/recommended',
				'plugin:import/errors',
				'plugin:import/warnings',
				'plugin:prettier/recommended',
			),
		),

		plugins: {
			react: fixupPluginRules(react),
			'react-hooks': fixupPluginRules(reactHooks),
			import: fixupPluginRules(_import),
			prettier: fixupPluginRules(prettier),
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			ecmaVersion: 2022,
			sourceType: 'module',

			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},

		settings: {
			react: {
				version: 'detect',
			},
		},

		rules: {
			// React Rules
			'react/jsx-uses-react': 'error',
			'react/react-in-jsx-scope': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// Import Rules
			'import/no-unresolved': 'error',
			'import/order': [
				'error',
				{
					groups: ['builtin', 'external', 'internal'],
				},
			],

			// Prettier Rule to handle formatting
			'prettier/prettier': 'error',

			// General Rules
			'no-unused-vars': [
				'error',
				{
					vars: 'all',
					args: 'none',
					ignoreRestSiblings: false,
				},
			],

			semi: ['error', 'always'],
			quotes: ['error', 'single'],
			indent: ['error', 'tab'],
			eqeqeq: ['warn', 'always'],
			'no-console': 'warn',
			'no-debugger': 'error',
		},
	},
	prettierConfig,
]);
