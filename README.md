# HTTP Status Check
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/guyellis/http-status-check?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/guyellis/http-status-check.svg?branch=master)](https://travis-ci.org/guyellis/http-status-check)
[![Code Climate](https://codeclimate.com/github/guyellis/http-status-check/badges/gpa.svg)](https://codeclimate.com/github/guyellis/http-status-check)
[![Coverage Status](https://coveralls.io/repos/guyellis/http-status-check/badge.png?branch=master)](https://coveralls.io/r/guyellis/http-status-check?branch=master)

Checks your sites' HTTP statuses

## Install

```
npm install http-status-check
```

##Run

```
node index.js
```

##Questions?

Feel free to contact me on twitter if you have any questions: [@wildfiction](https://twitter.com/wildfiction)

##Getting Started

Running `node index.js` should give you an indication
 of how it works. It uses the `samplesites.js` file for
 the names of the sites to test.
 
Copy `samplesites.js` to `checksites.js`. If `checksites.js`
is found then it takes precedence over `samplesites.js`.

Now edit `checksites.js` and replace the sites with your own sites
that you want to run checks on.

##checksites.js config file

The `samplesites.js` file is heavily commented and a good starting point.

* `sites` - an array of sites that will be checked
  * `name` - any name that you want to give this site. This will be logged to the console with the status.
  * `expectedStatus` - the status that you expected this site to return, e.g. 200 or 301
  * `requestUrl` - URL or array of URLs to of the site(s) to check
  * `responseHeaders` - an object with a collection of response headers expected back from the site. Each of these is compared to the actual response headers received. 
  * `requestHeaders` - an object with a collection of request headers to send with the request. 
  * `disabled` - defaults to false. Set to true if you don't want this site to be checked. Useful if you don't want to delete the details from the checksites.js config file but also don't want it run. Will appear in reports as "not run." 
  * `excludedHeaders` - An array of headers that you expect not to be returned by the server. (For example, for security you may not want the X-Powered-By header to be returned.) If any of these headers are present then the check will be considered a failure and reported as such.
  * `expectedText` - A string or an array of strings or an array of objects. If an array of objects then each object should have a string 'text' property and an optional boolean caseSensitive property 
    * `text` - The text to find on the page
    * `caseSensitive` - true/false to indicate if the comparison should be case sensitive. Defaults to false if missing and if expectedText is a string or array of strings.
* `concurrentRequests` - The number of sites to check at the same time. Defaults to 3 if this is missing
* `allSites` - Data that will be applied to each of the site objects above if it is missing from the site object. i.e. the data in the site object will take precedence over this data.
  
## Enhancements and Bugs

Add requests for enhancements and bugs to: [HTTP Status Check Issues](https://github.com/guyellis/http-status-check/issues)