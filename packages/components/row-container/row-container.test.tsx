import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import RowContainer from ".";

const baseProps = {
  manualHeight: "500px",
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<RowContainer />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      <RowContainer {...baseProps}>
        <span>Demo</span>
      </RowContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("stop event on context click", () => {
    const wrapper = shallow(
      <RowContainer>
        <span>Demo</span>
      </RowContainer>
    );

    const event = { preventDefault: () => {} };

    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    jest.spyOn(event, "preventDefault");

    wrapper.simulate("contextmenu", event);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(event.preventDefault).not.toBeCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders like list", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <RowContainer useReactWindow={false}>
        <span>Demo</span>
      </RowContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("height", "");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without manualHeight", () => {
    const wrapper = mount(
      <RowContainer>
        <span>Demo</span>
      </RowContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render with normal rows", () => {
    const wrapper = mount(
      <RowContainer {...baseProps}>
        // @ts-expect-error TS(2322): Type '{ children: string; contextOptions: { key: s... Remove this comment to see the full error message
        <div contextOptions={[{ key: "1", label: "test" }]}>test</div>
      </RowContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <RowContainer {...baseProps} id="testId">
        <span>Demo</span>
      </RowContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <RowContainer {...baseProps} className="test">
        <span>Demo</span>
      </RowContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <RowContainer {...baseProps} style={{ color: "red" }}>
        <span>Demo</span>
      </RowContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
