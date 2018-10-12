FQDN
---

Simple utility to get the FQDN of a machine. Can be used synchronously or asynchronously

___Why?:___ os.hostname() *only* returns the hostname rather than the FQDN

usage:
```
var fqdn = require("fqdn");

fqdn(function(err, res){
  if(err){
    throw err;
  }

  console.log(res);
});

/* OR */

var dn = fqdn();

```

___Works on Linux and MacOS___
