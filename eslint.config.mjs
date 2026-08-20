import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory and file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the compat layer for loading traditional configs
const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const config = [
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				projectService: true,
			},
		},
	},
	...compat.config({
		extends: [
			'next/typescript',
			'next',
			'plugin:@typescript-eslint/eslint-recommended',
			'plugin:@typescript-eslint/recommended',
			'plugin:react/recommended',
			'prettier',
		],
		ignorePatterns: [
			'.next/**', // Ignore Next.js build files
			'node_modules/**', // Ignore node_modules
			'dist/**', // Ignore distribution folder
		],
		parser: '@typescript-eslint/parser',
		parserOptions: {
			ecmaFeatures: {
				jsx: true,
			},
		},
		plugins: [
			'react',
			'@typescript-eslint',
			'prettier',
			'unused-imports',
			'import',
			'tailwindcss',
		],
		rules: {
			'react/prop-types': 'off', // <- Should be disabled in TypeScript
			'no-console': 'error',
			'prettier/prettier': ['error'],
			// quotes: ["error", "double"], // <- Reinforce double quotes usage
			semi: ['error', 'always'], // <- Always use semi-colons
			eqeqeq: ['error', 'always'], // <- Always use triple =
			'max-len': [
				'error',
				{
					code: 90,
					ignorePattern: '^className=*',
					ignoreUrls: true,
					ignoreStrings: true,
					ignoreComments: true,
				},
			],
			'no-trailing-spaces': ['error', { skipBlankLines: true }],
			'eol-last': ['error', 'always'],
			'react/jsx-uses-react': 'off',
			'react/react-in-jsx-scope': 'off',
			'no-unused-vars': [
				'error',
				{ args: 'after-used', argsIgnorePattern: '^_' },
			],
			'import/no-unresolved': 'error',
			// '@typescript-eslint/no-explicit-any': 'off',  // <- Allow usage of any type
		},
	}),
];

export default config;
