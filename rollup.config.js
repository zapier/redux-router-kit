import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/index.js',
  format: 'cjs',
  external: [
    'history/lib/createBrowserHistory',
    'history/lib/createLocation',
    'path-to-regexp',
    'query-string',
    'react',
    'prop-types',
    'react-redux',
    'url-parse'
  ],
  plugins: [
    babel({
      babelrc: false,
      presets: [
        ['es2015', {modules: false}],
        ['stage-2'],
        ['react']
      ],
      plugins: ['external-helpers']
    }),
  ],
  dest: 'lib/index.js'
};
