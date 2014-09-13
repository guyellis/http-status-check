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
  
## Future Features

Ideas for features that someone might find useful. These ideas can be implemented at workshops and used as training.

* Control Sites - Allow a config item on each site that is called 'control' or something similar. Defaults to false if missing and tells the script that we expect this site to be always available and use it to test our internet connection. e.g. google.com, yahoo.com, microsoft.com should always return 200 or 301. If they timeout then there's something wrong with our connectivity and we shouldn't assume a problem with the other sites. Run the control sites at the beginning and at the end.
* email out adapter - An out adapter that emails the results to an email recipient.
* twilio out adapter - An out adapter that sends the results via twilio.
* mongo in adapter - An in adapter that reads the input from a MongoDB.
