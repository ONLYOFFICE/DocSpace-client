import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import SocialButton from ".";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/share.google... Remove this comment to see the full error message
import ShareGoogleReactSvgUrl from "PUBLIC_DIR/images/share.google.react.svg?url";

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<SocialButton />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <SocialButton iconName={ShareGoogleReactSvgUrl} label={"Test Caption"} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("not re-render test", () => {
    // const onClick= () => alert('SocialButton clicked');

    const wrapper = shallow(
      // @ts-expect-error TS(2769): No overload matches this call.
      <SocialButton iconName={ShareGoogleReactSvgUrl} label={"Test Caption"} />
    ).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("disabled click test", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const testClick = jest.fn();

    const wrapper = mount(
      <SocialButton
        // @ts-expect-error TS(2769): No overload matches this call.
        iconName={ShareGoogleReactSvgUrl}
        label={"Test Caption"}
        onClick={testClick}
        isDisabled={true}
      />
    );

    wrapper.simulate("click");

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(testClick).toHaveBeenCalledTimes(0);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("click test", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const testClick = jest.fn();

    const wrapper = mount(
      <SocialButton
        // @ts-expect-error TS(2769): No overload matches this call.
        iconName={ShareGoogleReactSvgUrl}
        label={"Test Caption"}
        onClick={testClick}
        isDisabled={false}
      />
    );

    wrapper.simulate("click");

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(testClick).toHaveBeenCalledTimes(1);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <SocialButton iconName={ShareGoogleReactSvgUrl} id="testId" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2769): No overload matches this call.
      <SocialButton iconName={ShareGoogleReactSvgUrl} className="test" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      <SocialButton
        // @ts-expect-error TS(2769): No overload matches this call.
        iconName={ShareGoogleReactSvgUrl}
        style={{ color: "red" }}
      />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
