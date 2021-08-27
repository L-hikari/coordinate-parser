import { babel } from '@rollup/plugin-babel';

export default {
    input: './src/index.js',
    output: {
        name: 'Cparser',
        file: 'dist/Cparser.js',
        format: 'umd',
        sourcemap: true
    },
    plugins: [babel({ babelHelpers: 'bundled' })]
};