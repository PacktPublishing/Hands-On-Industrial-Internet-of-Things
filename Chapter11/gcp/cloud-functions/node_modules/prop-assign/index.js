'use strict';

module.exports = function (prop, value) {
  return function(obj) {
    obj[prop] = value;
    return obj;
  };
};
