# A WhatsOnChain API JS Wrapper library for Bitcoin SV Developer

[![NPM version](http://img.shields.io/npm/v/whatsonchain.svg)](https://www.npmjs.org/package/whatsonchain)
[![Build Status](https://secure.travis-ci.org/baryon/whatsonchain.png)](http://travis-ci.org/baryon/whatsonchain)

https://whatsonchain.com/

## Documentation

https://developers.whatsonchain.com/

## Install

---

```javascript
npm install whatsonchain --save
```

## Sample Usage

Check out these [test code](https://github.com/baryon/whatsonchain/tree/master/test) in JavaScript and TypeScript to get up and running quickly.

## History

### 0.2.0
- Support Cache, default is true. if you don't want cache, set option `{ enableCache: false }`
- Support ApiKey and rate limit to 3 requests/sec without apiKey.
```
  // with apiKey, no threshold
  const woc = new WhatsOnChain( 'testnet', { apiKey: 'your api key'}  )
```
```
  // without apiKey, threshold is 3 requests/1000ms
  const woc = new WhatsOnChain( 'testnet' )
```
- Support JSDoc type check.

### 0.1.0
- Initate, Support all API in document.

# License

It is released under the terms of the Open BSV license.
