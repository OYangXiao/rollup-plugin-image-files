import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { createFilter } from 'rollup-pluginutils';

const defaultExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

export default function image(options = {}) {
	const extensions = options.extensions || defaultExtensions;
	const includes = extensions.map(e => `**/*${e}`);
	const assetPath = options.assetPath || '';
	const filter = createFilter(options.include || includes, options.exclude);
	let images = [];

	function generateBundle(outputOptions, rendered) {
		const dir = resolve(
			outputOptions.dir || dirname(outputOptions.dest || outputOptions.file),
			assetPath
		);

		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}

		images.forEach(id => {
			writeFileSync(resolve(dir, basename(id)), readFileSync(id));
		});
	}

	return {
		name: 'image-file',
		load(id) {
			if ('string' !== typeof id || !filter(id)) {
				return null;
			}

			if (images.indexOf(id) < 0) {
				images.push(id);
			}

			return `const img = require('${('./' + assetPath + basename(id))
				.replace(/\/+/g, '/')
				.replace(/\/\.\//g, '/')}'); export default img;`;
		},
		generateBundle,
		ongenerate: generateBundle
	};
}
