import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import clear from 'rollup-plugin-clear'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss'

const cssFiles = dir => ({
  'src/style.less': dir + '/rb-table.less',
  'src/style.scss': dir + '/rb-table.scss'
});

import pkg from './package.json'

export default [
  // CommonJS
  {
    input: 'src/index.js',
    output: { file: 'lib/rb-table.js', format: 'cjs', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      clear({ targets: ['lib'] }),
      copy(cssFiles('lib')),
      postcss({
        plugins: [],
        extract: 'lib/rb-table.css'
      }),
      babel()
    ]
  },
  // ES
  {
    input: 'src/index.js',
    output: { file: 'es/rb-table.js', format: 'es', indent: false },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      copy(cssFiles('es')),
      postcss({
        plugins: [],
        extract: 'es/rb-table.css'
      }),
      babel()
    ]
  },

  // ES for Browsers
  {
    input: 'src/index.js',
    output: {
      file: 'es/rb-table.mjs', format: 'es', indent: false,
      globals: {
        react: 'React',
        'prop-types': 'PropTypes'
      }
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({ jsnext: true }),
      postcss({
        plugins: [],
        inject: true
      }),
      babel({
        exclude: 'node_modules/**',
      }),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      }),
      replace({ 'process.env.NODE_ENV': JSON.stringify('mjs') })
    ]
  },

  // UMD Development
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rb-table.js', format: 'umd',
      indent: false, name: 'RBTable',
      globals: {
        react: 'React',
        'prop-types': 'PropTypes'
      }
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        jsnext: true
      }),
      postcss({
        plugins: [],
        extract: 'dist/rb-table.css'
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },

  // UMD Production
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rb-table.min.js', format: 'umd',
      indent: false, name: 'RBTable',
      globals: {
        react: 'React',
        'prop-types': 'PropTypes'
      }
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        jsnext: true
      }),
      postcss({
        plugins: [],
        extract: 'dist/rb-table.min.css',
        minimize: true
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      copy(cssFiles('dist')),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  },

  // UMD Production bundled
  {
    input: 'src/index.js',
    output: {
      file: 'dist/rb-table.bundle.min.js', format: 'umd',
      indent: false, name: 'RBTable',
      globals: {
        react: 'React',
        'prop-types': 'PropTypes'
      }
    },
    external: [
      ...Object.keys(pkg.peerDependencies || {})
    ],
    plugins: [
      nodeResolve({
        jsnext: true
      }),
      postcss({
        inject: true,
        minimize: true
      }),
      babel({
        exclude: 'node_modules/**'
      }),
      copy(cssFiles('dist')),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      })
    ]
  }
] 