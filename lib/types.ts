'use strict';

export interface ExpectedTextObject {
  text: string;
  caseSensitive?: boolean;
}

export type ExpectedTextInput = string | ExpectedTextObject | (string | ExpectedTextObject)[];

export interface SiteConfig {
  name?: string;
  expectedStatus?: number;
  requestUrl?: string | string[];
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  excludedHeaders?: string[];
  expectedText?: unknown;
  followRedirect?: boolean;
  disabled?: boolean;
  verbose?: boolean;
  errors?: unknown;
}

export interface NormalizedSite {
  name?: string;
  expectedStatus?: number;
  requestUrl: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  excludedHeaders?: string[];
  expectedText?: ExpectedTextObject[];
  followRedirect?: boolean;
  disabled?: boolean;
  verbose?: boolean;
  errors?: unknown;
}

export interface RunData {
  sites?: SiteConfig[];
  [key: string]: unknown;
}

export interface Settings {
  allSites?: {
    excludedHeaders?: string[];
    requestHeaders?: Record<string, string>;
    verbose?: boolean;
    [key: string]: unknown;
  };
  concurrentRequests?: number;
  inAdapter?: {
    type: string;
  };
  [key: string]: unknown;
}

export interface OutAdapter {
  writeResult?(result: string, uri: NormalizedSite | Record<string, unknown>): void;
  done?(): void;
  [key: string]: unknown;
}

export interface InAdapter {
  findFile(): string;
  getRunData(): Promise<RunData>;
}
