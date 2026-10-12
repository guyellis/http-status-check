'use strict';

import async from 'async';
import _ from 'lodash';
import type {
  ExpectedTextObject,
  NormalizedSite,
  OutAdapter,
  RunData,
  Settings,
  SiteConfig,
} from './types.js';
import uriCheck from './uriCheck.js';

interface ExpectedTextError extends Error {
  expectedText?: unknown;
  type?: string;
}

const iterateURLs = function (concurrentRequests: number, sites: NormalizedSite[]): void {
  async.eachLimit(sites, concurrentRequests, uriCheck.checkUri, function (err) {
    if (err) {
      throw err;
    }
    uriCheck.done();
  });
};

// This function accepts an array of sites and if
// the requestUrl on any of its elements is an array
// it will duplicate that element and split out the
// elements of the requestUrl array
const expandRequestUrlInput = function (sites: SiteConfig[]): SiteConfig[] {
  const result = _.map(sites, function (site) {
    if (_.isArray(site.requestUrl)) {
      const urls = site.requestUrl;
      const baseSite = _.cloneDeep(site);
      delete (baseSite as Partial<SiteConfig>).requestUrl;
      return _.map(urls, function (url) {
        const newItem = _.cloneDeep(baseSite);
        newItem.requestUrl = url;
        return newItem;
      });
    } else {
      return site;
    }
  });

  return _.flatten(result as (SiteConfig | SiteConfig[])[]);
};

// This function accepts an array of sites and will
// iterate through each site object and expand the
// expectedText property out into an arry of objects
// if it is not already an array of objects.
const expandExpectedTextInput = function (sites: SiteConfig[]): NormalizedSite[] {
  let err: ExpectedTextError;
  return _.map(sites, function (site): NormalizedSite {
    if (site.expectedText) {
      // We expect site.expectdText to be one of the
      // following:
      // 1. a string: "some search text"
      // 2. an object: {text: "some search text", caseSensitive (optional): true/false }
      // 3. an array: Of 1. or 2. or a mixture of them.
      //
      // First step, if it's not an array then we need to get it into a 1 element array
      // for the rest of the function.
      const expectedTextArray = !_.isArray(site.expectedText)
        ? [site.expectedText]
        : site.expectedText;

      // Now we know that it's an array of 1 or more "somethings." We'll iterate through
      // that and make each of them objects and throw errors for anything we can't handle
      // or recognize
      const normalizedExpectedText = _.map(
        expectedTextArray,
        function (expectedText): ExpectedTextObject {
          if (_.isObject(expectedText)) {
            // We have an expectation that if this is already an object that it has at a minimum
            // the 'text' property
            const obj = expectedText as Record<string, unknown>;
            if (!('text' in obj) || !obj.text) {
              err = new Error('text property is missing from expectedText object.');
              err.expectedText = expectedText;
              throw err;
            }
            return expectedText as unknown as ExpectedTextObject;
          } else if (_.isString(expectedText)) {
            return { text: expectedText };
          } else {
            err = new Error('Unknown/Unexpected type for text property.');
            err.expectedText = expectedText;
            err.type = typeof expectedText;
            throw err;
          }
        },
      );
      return {
        ...site,
        expectedText: normalizedExpectedText,
        requestUrl: site.requestUrl as string,
      };
    }
    return site as NormalizedSite;
  });
};

const start = function (
  runData: RunData | Partial<RunData>,
  settings: Settings | Partial<Settings>,
  outAdapter?: OutAdapter,
  verbose?: boolean,
): void {
  const inputSites = runData && runData.sites ? runData.sites : [];
  let sites = manager.expandExpectedTextInput(manager.expandRequestUrlInput(inputSites));
  if (settings.allSites) {
    settings.allSites.verbose = verbose;
  }

  // At this point sites array has now been "normalized".
  // Now take the allSites data and apply that to each element of the sites
  // array that doesn't have that data
  sites = _.map(sites, function (item) {
    return _.assign(_.clone(settings.allSites), item);
  });

  let concurrentRequests = settings.concurrentRequests;
  if (!concurrentRequests || isNaN(concurrentRequests) || concurrentRequests < 1) {
    concurrentRequests = 3;
  }
  uriCheck.init(outAdapter);
  manager.iterateURLs(concurrentRequests, sites);
};

const manager = {
  expandExpectedTextInput: expandExpectedTextInput,
  expandRequestUrlInput: expandRequestUrlInput,
  iterateURLs: iterateURLs,
  run: start,
};

export { iterateURLs, expandRequestUrlInput, expandExpectedTextInput, start as run };

export default manager;
