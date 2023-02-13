# UHRP Topic Manager

Manages a UHRP Confederacy Topic

## Usage

Construct a Confederacy instance with this Topic Manager:

```js
const Confederacy = require('confederacy')
const UHRPManager = require('uhrp-manager')

const confederacy = new Confederacy({
  managers: {
    UHRP: new UHRPManager()
  },
  lookupServices: {
    // ...
  }
})
```