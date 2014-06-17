# HTTP Status Check

Checks your sites' HTTP statuses

[![Build Status](https://travis-ci.org/guyellis/http-status-check.svg?branch=master)](https://travis-ci.org/guyellis/http-status-check)

## Install

```
npm install http-status-check
```

##Run

```
node index.js
```

##Getting Started

Running `node index.js` should give you an indication
 of how it works. It uses the `samplesites.json` file for
 the names of the sites to test.
 
Copy `samplesites.json` to `checksites.json`. If `checksites.json`
is found then it takes precedence over `samplesites.json`.

Now edit `checksites.json` and replace the sites with your own sites
that you want to run checks on.

##checksites.json config file

* `sites` - an array of sites that will be checked
  * `name` - any name that you want to give this site. This will be logged to the console with the status.
  * `expectedStatus` - the status that you expected this site to return, e.g. 200 or 301
  * `requestUrl` - URL or array of URLs to of the site(s) to check
  * `responseHeaders` - an object with a collection of response headers expected back from the site. Each of these is compared to the actual response headers received. 
  * `requestHeaders` - an object with a collection of request headers to send with the request. 
  * `disabled` - defaults to false. Set to true if you don't want this site to be checked. Useful if you don't want to delete the details from the .json config file but also don't want it run. Will appear in reports as "not run." 
* `concurrentRequests` - The number of sites to check at the same time. Defaults to 3 if this is missing
  
  