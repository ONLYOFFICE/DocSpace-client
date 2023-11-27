import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import TextInput from ".";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<TextInput />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const wrapper = mount(<TextInput value="text" onChange={jest.fn()} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("not re-render test", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();

    const wrapper = shallow(
      <TextInput value="text" onChange={onChange} />
    ).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("re-render test by value", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();

    const wrapper = shallow(
      <TextInput value="text" onChange={onChange} />
    ).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate({
      ...wrapper.props,
      value: "another text",
    });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      <TextInput value="text" onChange={jest.fn()} id="testId" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      <TextInput value="text" onChange={jest.fn()} className="test" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
      <TextInput value="text" onChange={jest.fn()} style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
