import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import Scrollbar from ".";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<Scrollbar />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    // @ts-expect-error TS(2559): Type '{ children: string; }' has no properties in ... Remove this comment to see the full error message
    const wrapper = mount(<Scrollbar>Some content</Scrollbar>);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; }' is not assignable to type '... Remove this comment to see the full error message
    const wrapper = mount(<Scrollbar id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; }' is not assignable to... Remove this comment to see the full error message
    const wrapper = mount(<Scrollbar className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    // @ts-expect-error TS(2322): Type '{ style: { color: string; }; }' is not assig... Remove this comment to see the full error message
    const wrapper = mount(<Scrollbar style={{ color: "red" }} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
