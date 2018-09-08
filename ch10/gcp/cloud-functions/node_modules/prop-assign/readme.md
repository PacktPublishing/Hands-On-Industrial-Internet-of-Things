# prop-assign
> Assign a value to a property in an Array iterator

```sh
$ npm install --save prop-assign
```
```js
var propAssign = require('prop-assign');

var users = [
  { id: 1, name: 'Dave' },
  { id: 2, name: 'Stephen' }
];

users.map(propAssign('time', Date.now()));
// [
//   { id: 1, name: 'Dave', time: [Date] },
//   { id: 2, name: 'Stephen', time: [Date] },
// ]
```
