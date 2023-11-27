import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import FieldContainer from ".";
import TextInput from "../text-input";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<FieldContainer />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: Element; labelText: string; }' i... Remove this comment to see the full error message
      <FieldContainer labelText="Name:">
        <TextInput value="" onChange={(e: any) => console.log(e.target.value)} />
      </FieldContainer>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; }' is not assignable to type '... Remove this comment to see the full error message
    const wrapper = mount(<FieldContainer id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; }' is not assignable to... Remove this comment to see the full error message
    const wrapper = mount(<FieldContainer className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    // @ts-expect-error TS(2322): Type '{ style: { color: string; }; }' is not assig... Remove this comment to see the full error message
    const wrapper = mount(<FieldContainer style={{ color: "red" }} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
