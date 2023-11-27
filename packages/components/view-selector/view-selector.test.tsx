import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import "jest-styled-components";
import ViewSelector from ".";

const baseProps = {
  isDisabled: false,
  isFilter: false,
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onChangeView: jest.fn(),
  viewAs: "row",
  viewSettings: [
    {
      value: "row",
      icon: "",
    },
    {
      value: "tile",
      icon: "",
    },
    {
      value: "some",
      icon: "",
    },
  ],
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<ViewSelector />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<ViewSelector {...baseProps} />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render with disabled", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ isDisabled: true; isFilter: boolean; onCha... Remove this comment to see the full error message
      <ViewSelector onClick={jest.fn()} {...baseProps} isDisabled={true} />
    );
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("id, className, style is exist", () => {
    const wrapper = mount(
      <ViewSelector
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ id: string; className: string; style: { co... Remove this comment to see the full error message
        id="testId"
        className="test"
        style={{ color: "red" }}
      />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts isDisabled", () => {
    const wrapper = mount(<ViewSelector {...baseProps} isDisabled />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isDisabled")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts isFilter", () => {
    const wrapper = mount(<ViewSelector {...baseProps} isFilter />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isFilter")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts viewAs", () => {
    const wrapper = mount(<ViewSelector {...baseProps} viewAs="tile" />);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("viewAs")).toEqual("tile");
  });
});
