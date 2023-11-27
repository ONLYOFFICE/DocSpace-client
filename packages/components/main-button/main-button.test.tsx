import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import MainButton from ".";
import Button from "../button";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<MainButton />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: Element[]; text: string; isDisab... Remove this comment to see the full error message
      <MainButton text="Button" isDisabled={false} isDropdown={true}>
        <div>Some button</div>
        // @ts-expect-error TS(2322): Type '{ label: string; }' is not assignable to typ... Remove this comment to see the full error message
        <Button label="Some button" />
      </MainButton>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: Element[]; text: string; isDisab... Remove this comment to see the full error message
      <MainButton
        text="Button"
        isDisabled={false}
        isDropdown={true}
        id="testId"
      >
        <div>Some button</div>
        // @ts-expect-error TS(2322): Type '{ label: string; }' is not assignable to typ... Remove this comment to see the full error message
        <Button label="Some button" />
      </MainButton>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: Element[]; text: string; isDisab... Remove this comment to see the full error message
      <MainButton
        text="Button"
        isDisabled={false}
        isDropdown={true}
        className="test"
      >
        <div>Some button</div>
        // @ts-expect-error TS(2322): Type '{ label: string; }' is not assignable to typ... Remove this comment to see the full error message
        <Button label="Some button" />
      </MainButton>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: Element[]; text: string; isDisab... Remove this comment to see the full error message
      <MainButton
        text="Button"
        isDisabled={false}
        isDropdown={true}
        style={{ color: "red" }}
      >
        <div>Some button</div>
        // @ts-expect-error TS(2322): Type '{ label: string; }' is not assignable to typ... Remove this comment to see the full error message
        <Button label="Some button" />
      </MainButton>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
