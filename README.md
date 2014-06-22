# HTTP Status Check

[![Build Status](https://travis-ci.org/guyellis/http-status-check.svg?branch=master)](https://travis-ci.org/guyellis/http-status-check)

Checks your sites' HTTP statuses

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
  
## Future Features

Ideas for features that someone might find useful. These ideas can be implemented at workshops and used as training.

* Control Sites - Allow a config item on each site that is called 'control' or something similar. Defaults to false if missing and tells the script that we expect this site to be always available and use it to test our internet connection. e.g. google.com, yahoo.com, microsoft.com should always return 200 or 301. If they timeout then there's something wrong with our connectivity and we shouldn't assume a problem with the other sites. Run the control sites at the beginning and at the end.
* email out adapter - An out adapter that emails the results to an email recipient.
* twilio out adapter - An out adapter that sends the results via twilio.
* mongo in adapter - An in adapter that reads the input from a MongoDB.
* onPageText - An optional array of strings in the config json file against each site. Check the returned HTML from each request against the collection of strings and fail if not found. (Questions: Should be case insensitive? Should be able to specify case sensitivity?)