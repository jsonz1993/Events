# Events
Node's event emitter for ts.

oh 这只是一个练手的小玩具

[ts + jest + rollup 实现EventBugs](https://jsonz1993.github.io/typescript-package-example-event/)

# Usage
``` JavaScript
var EventEmitter = require('events')

var ee = new EventEmitter()
ee.on('message', function (text) {
  console.log(text)
})
ee.emit('message', 'hello world')
```

# API
See the [Node.js EventEmitter docs](https://nodejs.org/dist/v11.13.0/docs/api/events.html). events currently matches the Node.js 11.x API.

# License
[MIT](./LICENSE)
