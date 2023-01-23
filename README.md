# UMP Topic Manager

Manages a UMP Confederacy Topic

## Usage

Construct a Confederacy instance with this Topic Manager:

```js
const Confederacy = require('confederacy')
const UMPManager = require('ump-manager')

const confederacy = new Confederacy({
  managers: {
    UMP: new UMPManager()
  },
  lookupServices: {
    // ...
  }
})
```