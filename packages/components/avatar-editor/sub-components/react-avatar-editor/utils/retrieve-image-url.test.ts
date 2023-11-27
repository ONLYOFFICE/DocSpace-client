/* eslint-env jest */

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("retrieveImageURL", () => {
  let retrieveImageURL: any, mockParseDOM: any, mockQuerySelector: any;

  // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
  beforeEach(() => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    mockQuerySelector = jest.fn();
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    mockParseDOM = jest.fn();

    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    jest.mock("./parse-dom", () => mockParseDOM);

    retrieveImageURL = require("./retrieve-image-url").default;
    mockParseDOM = require("./parse-dom");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('runs getAsString on the first item with type "text/html"', () => {
    const items = [
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      { getAsString: jest.fn(), type: "something/else" },
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      { getAsString: jest.fn(), type: "text/html" },
    ];

    retrieveImageURL(items, () => {});

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(items[0].getAsString).not.toHaveBeenCalled();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(items[1].getAsString).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not run getAsString on later items with type "text/html"', () => {
    const items = [
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      { getAsString: jest.fn(), type: "text/html" },
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      { getAsString: jest.fn(), type: "text/html" },
    ];

    retrieveImageURL(items, () => {});

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(items[0].getAsString).toHaveBeenCalled();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(items[1].getAsString).not.toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("with html returned in getAsString callback", () => {
    let callback: any, invokeGetAsStringCallback: any;

    // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
    beforeEach(() => {
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      const items = [{ getAsString: jest.fn(), type: "text/html" }];

      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      callback = jest.fn();

      mockParseDOM.mockReturnValue({
        querySelector: mockQuerySelector,
      });

      retrieveImageURL(items, callback);

      invokeGetAsStringCallback = () =>
        items[0].getAsString.mock.calls[0][0]('<div id="test-fragment"></div>');
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("creates a document using parseDOM", () => {
      invokeGetAsStringCallback();
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(mockParseDOM).toHaveBeenCalledWith(
        '<div id="test-fragment"></div>'
      );
    });

    // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it("searches for img elements", () => {
      invokeGetAsStringCallback();
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(mockQuerySelector).toHaveBeenCalledWith("img");
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe("if the document contains an img with a src attribute", () => {
      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        mockQuerySelector.mockReturnValue({
          src: "http://placekitten.com/100/100",
        });
        invokeGetAsStringCallback();
      });

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it("should invoke the callback passed to retrieveImageURL with the value of the src attribute", () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(callback).toHaveBeenCalledWith("http://placekitten.com/100/100");
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe("if the document contains an img without a src attribute", () => {
      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        mockQuerySelector.mockReturnValue({});
        invokeGetAsStringCallback();
      });

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it("should invoke the callback passed to retrieveImageURL with the value of the src attribute", () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(callback).not.toHaveBeenCalled();
      });
    });

    // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
    describe("if the documetn does not contain an img", () => {
      // @ts-expect-error TS(2304): Cannot find name 'beforeEach'.
      beforeEach(() => {
        mockQuerySelector.mockReturnValue(null);
        invokeGetAsStringCallback();
      });

      // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
      it("should invoke the callback passed to retrieveImageURL with the value of the src attribute", () => {
        // @ts-expect-error TS(2304): Cannot find name 'expect'.
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });
});
