import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'
const env = process.env.NODE_ENV
const config = {
  input: 'src/index.js',
  plugins: [],
  external: ['react', 'prop-types']
}

if (env === 'es' || env === 'cjs') {
  config.output = {
    format: env, indent: false, globals: {
      'react': 'React',
      'prop-types': 'PropTypes'
    }
  }
  config.plugins.push(
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    })
  )
}

if (env === 'development' || env === 'production') {
  config.output = {
    format: 'umd', name: 'RBTable', indent: false, globals: {
      'react': 'React',
      'prop-types': 'PropTypes'
    }
  }
  config.plugins.push(
    nodeResolve({
      jsnext: true
    }),
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  )
}

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
