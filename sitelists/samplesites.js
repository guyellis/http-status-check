'use strict';

// Copy samplesites.js to checksites.js.
// If checksites.js is found then it takes precedence over samplesites.js
// .gitignore is set to NOT commit checksites.js so you can keep your
// personal/client site list in here.

module.exports = {
  // concurrentRequests is an integer greater than zero. It specifies
  // the number of checks that you want to run in parallel.
  concurrentRequests: 3,
  // The allSites property applies each of its properties to each
  // site list in the "sites" array. For example, you might decide
  // that the excludeHeaders property with the 'X-Powered-By' item
  // is checked for all sites.
  allSites: {
    excludedHeaders: ['X-Powered-By'],
    requestHeaders: {
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:30.0) Gecko/20100101 Firefox/30.0"
    }
  },
  // The sites key is an array of URIs objects that will be checked.
  sites: [
    {
      // The name is any name you want. It's used for reporting so make
      // it meaningful to you.
      name: "LinkSilk",
      // The expectedStatus is the HTTP status that you expect this URI
      // to return. A normal successful HTTP status from a healthy server
      // is 200. You can find a list of HTTP status codes here:
      // http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      expectedStatus: 200,
      // The requestUrl is the URI that you want checked.
      requestUrl: "http://linksilk.com"
    },
    {
      name: "LinkSilk WWW",
      expectedStatus: 301,
      requestUrl: "http://www.linksilk.com",
      // The responseHeaders is a collection of HTTP headers you expect the
      // server to return. This example expects an HTTP status of 301 which
      // is a redirect. Accompanying the redirect you need a location header
      // which tells the requester where to redirect to.
      responseHeaders: {
        location: "http://linksilk.com/"
      },
      // The excludedHeaders array is a list of HTTP headers that you don't
      // expect the server to return. For example, for security you might have
      // disabled the 'X-Powered-By' header. If any of these headers are found
      // in the response headers then the check will fail.
      // NOTE: Not implemented yet, for future development.
      excludedHeaders: ['X-Powered-By']
    },
    {
      name: "LinkSilk Redirect To 200",
      expectedStatus: 200,
      requestUrl: "http://www.linksilk.com",
      // By setting followRedirect to true we are telling HTTP Status Check
      // to follow any 300 to 399 status until it gives us a non-300 series
      // status and then check that against the expectedStatus.
      // This is useful if you have a collection of short URLs like bit.ly
      // that point to other URLs that might go bad. For example, you wrote
      // an ebook and cleverly put bit.ly URLs in the eBook instead of
      // the real URL so when the real URL is moved or goes away you can change
      // where the bit.ly address points to. In order to keep track of which
      // bit.ly addresses are still good you run them through HTTP Status Check
      // with the followRedirect set to true which makes sure the final status
      // is what you expect, usually a 200.
      followRedirect: true
    },
    {
      name: "Google",
      expectedStatus: 301,
      requestUrl: "http://google.com",
      responseHeaders: {
        location: "http://www.google.com/"
      },
      // The disabled setting defaults to false. Use it if you want to temporarily
      // disable the checking of a URL and don't want to remove the information
      // from this file.
      disabled: true
    },
    {
      name: "HTTP Status Check on Guy's Blog",
      expectedStatus: 200,
      requestUrl: "http://www.guyellisrocks.com/2014/06/http-status-check.html",
      // The expectedText property can be a string, an object or an array.
      // If it's a string then it denotes the case-insensitive text that is expected
      //   in the body of the response.
      // If it's an object then a string 'text' property with the expected text should
      //   be present. The object has an optional caseSensitive property that defaults
      //   to false.
      // If it's an array then it should be a collection of the strings and/or objects
      //   described above.
      expectedText: 'a list of URLs'
    },
    {
      name: "Missing URL example",
      expectedStatus: 404,
      requestUrl: "http://www.guyellisrocks.com/2014/06/will-this-get-written.html"
    }
  ]
};
