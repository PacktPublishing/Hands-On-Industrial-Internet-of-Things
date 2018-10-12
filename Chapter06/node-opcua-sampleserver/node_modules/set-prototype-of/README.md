# Object.setPrototypeOf Polyfill (set-prototype-of)

### Example
```js
require('set-prototype-of'); // Object.setPrototypeOf Polyfill
Object.setPrototypeOf(obj, proto);
```

#### Syntax
```js
Object.setPrototypeOf(obj, prototype);
```

#### Parameters
* obj - The object which is to have its prototype set.
* prototype - The object's new prototype (an object or null).

### Description
Throws a TypeError exception if the object whose [[Prototype]] is to be modified is non-extensible according to Object.isExtensible(). Does nothing if the prototype parameter isn't an object or null (i.e., number, string, boolean, or undefined). Otherwise, this method changes the [[Prototype]] of obj to the new value.

`Object.setPrototypeOf()` is in the latest ECMAScript 6 standard draft. It is generally considered the proper way to set the prototype of an object, vs. the more controversial `Object.prototype.__proto__` property.

### License
MIT