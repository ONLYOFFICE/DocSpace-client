/* eslint-env jest */

import parseDOM from "./parse-dom";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("parseDOM", () => {
  let realDOMParser: any, result: any;

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    realDOMParser = global.DOMParser;
  });

  // @ts-expect-error TS(2304): Cannot find name 'afterEach'.
  afterEach(() => {
    global.DOMParser = realDOMParser;
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("DOMParser available", () => {
    let parseFromString: any;

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      parseFromString = jest.fn().mockReturnValue("%document%");
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      global.DOMParser = jest.fn(() => ({ parseFromString }));

      result = parseDOM('<div id="test"></div>');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("creates a new DOMParser", () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(global.DOMParser).toHaveBeenCalled();
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("calls parseFromString with the passed-in string", () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(parseFromString).toHaveBeenCalledWith(
        '<div id="test"></div>',
        "text/html"
      );
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("returns the value returned by parseFromString", () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(result).toBe("%document%");
    });
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("No DOMParser available", () => {
    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      // @ts-expect-error TS(2322): Type 'undefined' is not assignable to type '{ new ... Remove this comment to see the full error message
      global.DOMParser = undefined;

      result = parseDOM('<div id="test"></div>');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("retuns null", () => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(result).toBeNull();
    });
  });
});
