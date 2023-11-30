import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import Backdrop from ".";

const baseProps = {
  visible: false,
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<Backdrop />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<Backdrop {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("visible", () => {
    // @ts-expect-error TS(2322): Type '{ visible: true; }' is not assignable to typ... Remove this comment to see the full error message
    const wrapper = mount(<Backdrop visible />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("visible")).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; visible: boolean; }' is not as... Remove this comment to see the full error message
    const wrapper = mount(<Backdrop {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className string", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; visible: boolean; }' is... Remove this comment to see the full error message
    const wrapper = mount(<Backdrop {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className array", () => {
    const testArr = ["test", "backdrop-active not-selectable"];
    // @ts-expect-error TS(2322): Type '{ className: string[]; visible: boolean; }' ... Remove this comment to see the full error message
    const wrapper = mount(<Backdrop {...baseProps} className={["test"]} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual(expect.arrayContaining(testArr));
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ style: { color: string; }; visible: boolea... Remove this comment to see the full error message
      <Backdrop {...baseProps} style={{ color: "red" }} visible={true} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
