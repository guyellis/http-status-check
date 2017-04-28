# HTTP Status Check

[![Greenkeeper badge](https://badges.greenkeeper.io/guyellis/http-status-check.svg)](https://greenkeeper.io/)
[![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/guyellis/http-status-check?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/guyellis/http-status-check.svg?branch=master)](https://travis-ci.org/guyellis/http-status-check)
[![Code Climate](https://codeclimate.com/github/guyellis/http-status-check/badges/gpa.svg)](https://codeclimate.com/github/guyellis/http-status-check)
[![Dependency Status](https://david-dm.org/guyellis/http-status-check.png)](https://david-dm.org/guyellis/http-status-check)

Checks your sites' HTTP statuses

## Install

```
npm install http-status-check
```

##Run

```
node index.js
```

To show only failures in the output:

```
node index.js --only-output-failures
```

##Questions?

Feel free to contact me on twitter if you have any questions: [@wildfiction](https://twitter.com/wildfiction)

##Objectives

The objectives of the http-status-check project are as follows:

* Provide a fully-functional utility that most web developers will find useful for keeping tabs on the health of web sites that they are responsible for.
* Provide an example codebase that can be used in workshops and presentations for developers who are learning Node.js
* Provide examples of how a Node.js project can be structured, tested and reported on.
* Provide a safe and encouraging environment for developers who are new to Open Source development to get their feet wet in contributing for the first time (through pull requests).
* Maintain 100% coverage and demonstrate that this might not just be a vanity metric.

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
  * `followRedirect` - If a URL returns redirect status (300 to 399) then continue to follow any redirects and don't check until an non-300 series status is returned. See samplesites.js for use case and further details.
  * `expectedText` - A string or an array of strings or an array of objects. If an array of objects then each object should have a string 'text' property and an optional boolean caseSensitive property 
    * `text` - The text to find on the page
    * `caseSensitive` - true/false to indicate if the comparison should be case sensitive. Defaults to false if missing and if expectedText is a string or array of strings.
* `concurrentRequests` - The number of sites to check at the same time. Defaults to 3 if this is missing
* `allSites` - Data that will be applied to each of the site objects above if it is missing from the site object. i.e. the data in the site object will take precedence over this data.
  
## Enhancements and Bugs

Add requests for enhancements and bugs to: [HTTP Status Check Issues](https://github.com/guyellis/http-status-check/issues)

## Contribute

You are encouraged to fork this repository, edit the code, and submit a pull request to have your changes included.
 Even if you have never done this before and it seems scary. Especially if you have never done this before. One of the
 objectives of this project is to provide a safe and encouraging project where new comers can learn about the mechanics
 of open source, GitHub source control and coding in JavaScript.
 
If you are completely new then the best place to start is to start by seeing if you can add a unit test to the project.
A test will improve the quality and health of the project and not break anything that anyone is using. You can also
add comments and debug() statements to existing tests as you read understand and learn the code. There's also nothing
wrong in adding a question in the code if something isn't obvious. Hopefully someone will replace your question with
an explanation of how that section of code works.

Once you feel comfortable then try and improve existing code. The unit tests should protect you against making mistakes.
You can try and find inefficiencies or better ways to do something. For example, replace a loop with a lodash method.

Have a look at the code coverage and see if you can find some code that hasn't been covered by a test and fill that gap.

