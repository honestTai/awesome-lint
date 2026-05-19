import fs from 'node:fs';
import path from 'node:path';
import {lintRule} from 'unified-lint-rule';
import {visit} from 'unist-util-visit';

const awesomeBadgeSourceUrls = new Set([
	'https://awesome.re/badge.svg',
	'https://awesome.re/badge-flat.svg',
	'https://awesome.re/badge-flat2.svg',
]);

const getUrlPathname = url => {
	try {
		return new URL(url).pathname;
	} catch {
		return url.split(/[?#]/)[0];
	}
};

const isSvg = url => getUrlPathname(url).toLowerCase().endsWith('.svg');

const hasHighDensityFilename = url => /[-.@_](?:1\.\d+|[2-9])x\.[a-z\d]+$/i.test(getUrlPathname(url));

const hasHighDensitySrcset = srcset => typeof srcset === 'string' && srcset
	.split(',')
	.some(source => /\s(?:1\.\d+|[2-9])x(?:\s|$)/.test(source.trim()));

const parseDimensionAttribute = value => {
	if (typeof value !== 'string') {
		return;
	}

	const match = value.trim().match(/^(\d+(?:\.\d+)?)(?:px)?$/i);
	return match ? Number(match[1]) : undefined;
};

const readImageDimensions = filePath => {
	let buffer;

	try {
		buffer = fs.readFileSync(filePath);
	} catch {
		return;
	}

	if (buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
		return {
			width: buffer.readUInt32BE(16),
			height: buffer.readUInt32BE(20),
		};
	}

	if (buffer.length >= 10 && buffer.toString('ascii', 0, 3) === 'GIF') {
		return {
			width: buffer.readUInt16LE(6),
			height: buffer.readUInt16LE(8),
		};
	}

	if (buffer.length > 4 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
		let offset = 2;

		while (offset < buffer.length) {
			if (buffer[offset] !== 0xFF) {
				offset++;
				continue;
			}

			const marker = buffer[offset + 1];
			const length = buffer.readUInt16BE(offset + 2);

			if (
				(marker >= 0xC0 && marker <= 0xC3)
				|| (marker >= 0xC5 && marker <= 0xC7)
				|| (marker >= 0xC9 && marker <= 0xCB)
				|| (marker >= 0xCD && marker <= 0xCF)
			) {
				return {
					width: buffer.readUInt16BE(offset + 7),
					height: buffer.readUInt16BE(offset + 5),
				};
			}

			offset += 2 + length;
		}
	}
};

const isRelativeUrl = url => !/^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(url) && !url.startsWith('data:');

const hasLocalHighDensityDimensions = (image, file) => {
	const width = parseDimensionAttribute(image.attributes?.width);
	const height = parseDimensionAttribute(image.attributes?.height);

	if (!width && !height) {
		return false;
	}

	const {url} = image;
	if (!isRelativeUrl(url)) {
		return false;
	}

	const imagePath = path.resolve(file.dirname ?? '.', decodeURIComponent(getUrlPathname(url)));
	const dimensions = readImageDimensions(imagePath);

	if (!dimensions) {
		return false;
	}

	return (!width || dimensions.width >= width * 2) && (!height || dimensions.height >= height * 2);
};

const parseAttributes = value => {
	const attributes = {};
	const attributePattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

	for (const match of value.matchAll(attributePattern)) {
		const [, name, doubleQuotedValue, singleQuotedValue, unquotedValue] = match;
		attributes[name.toLowerCase()] = doubleQuotedValue ?? singleQuotedValue ?? unquotedValue ?? '';
	}

	return attributes;
};

const findHtmlImages = node => {
	const images = [];
	const imagePattern = /<img\b[^>]*>/gi;

	for (const match of node.value.matchAll(imagePattern)) {
		const attributes = parseAttributes(match[0]);
		if (attributes.src) {
			images.push({
				node,
				url: attributes.src,
				attributes,
			});
		}
	}

	return images;
};

const findMarkdownImages = node => {
	const images = [];

	visit(node, 'image', imageNode => {
		images.push({
			node: imageNode,
			url: imageNode.url,
			attributes: {},
		});
	});

	return images;
};

const findImages = node => node.type === 'html' ? findHtmlImages(node) : findMarkdownImages(node);

const isTopLevelH1 = node => node.type === 'heading' && node.depth === 1;

const isHtmlHeading = node => node.type === 'html' && /<h1[\s>]/i.test(node.value);

const isImageBlock = node => findImages(node).length > 0;

const isAwesomeBadge = image => awesomeBadgeSourceUrls.has(image.url);

const isValidHeaderImage = (image, file) =>
	isSvg(image.url)
	|| hasHighDensityFilename(image.url)
	|| hasHighDensitySrcset(image.attributes?.srcset)
	|| hasLocalHighDensityDimensions(image, file);

const headerImageRule = lintRule('remark-lint:awesome-header-image', (ast, file) => {
	const mainHeadingIndex = ast.children.findIndex(node => isTopLevelH1(node) || isHtmlHeading(node));

	for (const [index, node] of ast.children.entries()) {
		const inHeaderArea = index === 0
			|| index < mainHeadingIndex
			|| index === mainHeadingIndex
			|| (mainHeadingIndex !== -1 && index === mainHeadingIndex + 1);

		if (!inHeaderArea || !isImageBlock(node)) {
			continue;
		}

		for (const image of findImages(node)) {
			if (isAwesomeBadge(image)) {
				continue;
			}

			if (!isValidHeaderImage(image, file)) {
				file.message('Header image must be SVG or high-DPI', image.node);
			}

			return;
		}
	}
});

export default headerImageRule;
