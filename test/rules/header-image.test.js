import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import remarkLint from 'remark-lint';
import lint from '../_lint.js';
import headerImageRule from '../../rules/header-image.js';

describe('rules › header-image', () => {
	const config = {
		plugins: [
			remarkLint,
			headerImageRule,
		],
	};

	it('header image - missing is allowed', async () => {
		const messages = await lint({config, filename: 'test/fixtures/header-image/success-no-image.md'});
		assert.deepEqual(messages, []);
	});

	it('header image - SVG', async () => {
		const messages = await lint({config, filename: 'test/fixtures/header-image/success-svg.md'});
		assert.deepEqual(messages, []);
	});

	it('header image - high-DPI filename', async () => {
		const messages = await lint({config, filename: 'test/fixtures/header-image/success-high-dpi-filename.md'});
		assert.deepEqual(messages, []);
	});

	it('header image - high-DPI srcset', async () => {
		const messages = await lint({config, filename: 'test/fixtures/header-image/success-srcset.md'});
		assert.deepEqual(messages, []);
	});

	it('header image - raster image after H1', async () => {
		const messages = await lint({config, filename: 'test/fixtures/header-image/error-after-heading.md'});
		assert.deepEqual(messages, [
			{
				line: 3,
				ruleId: 'awesome-header-image',
				message: 'Header image must be SVG or high-DPI',
			},
		]);
	});

	it('header image - raster image before H1', async () => {
		const messages = await lint({config, filename: 'test/fixtures/header-image/error-before-heading.md'});
		assert.deepEqual(messages, [
			{
				line: 1,
				ruleId: 'awesome-header-image',
				message: 'Header image must be SVG or high-DPI',
			},
		]);
	});

	it('header image - markdown raster image after H1', async () => {
		const messages = await lint({config, filename: 'test/fixtures/header-image/error-markdown-image.md'});
		assert.deepEqual(messages, [
			{
				line: 3,
				ruleId: 'awesome-header-image',
				message: 'Header image must be SVG or high-DPI',
			},
		]);
	});
});
