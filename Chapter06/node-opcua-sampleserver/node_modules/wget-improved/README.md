# wget-improved
[![CircleCI](https://circleci.com/gh/bearjaws/node-wget/tree/master.svg?style=svg)](https://circleci.com/gh/bearjaws/node-wget/tree/master)

wget-improved simplifies retrieving files from any URL

Improvements over [wuchengwei/node-wget](https://github.com/wuchengwei/node-wget)
- Handles 3xx redirects (including infinite redirect loops)
- Passes URL parameters
- Better error reporting
- Does not write using append (uses w+ identical to wget)
- Handles gzip compression, allow you to automatically gunzip the stream

## Install

```
npm install wget-improved --save
```

## download(src, output, options)

```js
const wget = require('wget-improved');
const src = 'http://nodejs.org/images/logo.svg';
const output = '/tmp/logo.svg';
const options = {
    // see options below
};
let download = wget.download(src, output, options);
download.on('error', function(err) {
    console.log(err);
});
download.on('start', function(fileSize) {
    console.log(fileSize);
});
download.on('end', function(output) {
    console.log(output);
});
download.on('progress', function(progress) {
    typeof progress === 'number'
    // code to show progress bar
});
```

## request(options, callback)

```js
const wget = require('wget');
const options = {
    protocol: 'https',
    host: 'raw.github.com',
    path: '/Fyrd/caniuse/master/data.json',
    proxy: 'http://host:port',
    method: 'GET'
};
let req = wget.request(options, function(res) {
    let content = '';
    if (res.statusCode === 200) {
        res.on('error', function(err) {
            console.log(err);
        });
        res.on('data', function(chunk) {
            content += chunk;
        });
        res.on('end', function() {
            console.log(content);
        });
    } else {
        console.log('Server respond ' + res.statusCode);
    }
});

req.end();
req.on('error', function(err) {
    console.log(err);
});
```

## options

```js

options = {}
    // Set to true to have any gzip stream automatically decompressed before saving
    options.gunzip = false;
    options.proxy = {};
        options.proxy.protocol = 'http';
        options.proxy.host = 'someproxy.org';
        options.proxy.port = 1337;
        options.proxy.proxyAuth = '{basic auth}';
        options.proxy.headers = {'User-Agent': 'Node'};
```

## CLI

```bash
# If installed globally
nwget https://raw.github.com/Fyrd/caniuse/master/data.json -O /tmp/data.json

# If not installed globally
./node_modules/.bin/nwget https://raw.github.com/Fyrd/caniuse/master/data.json -O /tmp/data.json
```

## Changes from 2.0.0 to 3.0.0
**Progress is now returned as a Number instead of a String**

**On start filesize can return null when the remote server does not provided content-lenth**

Exception for not specifying protocol is now: `Your URL must use either HTTP or HTTPS.`

Supports handling redirects that return a relative URL.

You can now get events for the **total** number of bytes downloaded `download.on('bytes', function(bytes) {}...)`

Request headers can be specified by passing an object to options.headers.

Unit tests have been added for most download functionality and error cases. Tests are a requirement for all PRs going forward!

