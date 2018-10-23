import table from './table'
import './style.less'
/*
 * This is a dummy function to check if the function name has been altered by minification.
 * If the function has been minified and NODE_ENV !== 'production', warn the user.
 */
function isCrushed() { }

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed' &&
  typeof console !== 'undefined' && typeof console.error === 'function'
) {
  console.error(
    'You are currently using minified code outside of NODE_ENV === "production". ' +
    'This means that you are running a slower development build of rb-component. ' +
    'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' +
    'to ensure you have the correct code for your production build.'
  )
}

export default table