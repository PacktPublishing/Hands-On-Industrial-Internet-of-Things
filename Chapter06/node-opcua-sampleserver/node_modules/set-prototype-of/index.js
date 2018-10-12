/**
 * ES6 Object.getPrototypeOf Polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
 */

Object.setPrototypeOf = Object.setPrototypeOf || setPrototypeOf

function setPrototypeOf (obj, proto) {
  obj.__proto__ = proto
  return obj
}

module.exports = setPrototypeOf.bind(Object)
