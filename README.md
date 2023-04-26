# Postboard Topic Manager

Manages a Postboard Confederacy Topic

## Usage

Construct a Confederacy instance with this Topic Manager:

```js
const Confederacy = require('confederacy')
const PostboardManager = require('postboard-topic-manager')

const confederacy = new Confederacy({
  managers: {
    Postboard: new PostboardManager()
  },
  lookupServices: {
    // ...
  }
})
```