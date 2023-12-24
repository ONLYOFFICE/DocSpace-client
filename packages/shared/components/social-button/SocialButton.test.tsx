import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import ShareGoogleReactSvgUrl from "PUBLIC_DIR/images/share.google.react.svg?url";

import { SocialButton } from "./SocialButton";

describe("<SocialButton />", () => {
  it("renders without error", () => {
    render(<SocialButton iconName={ShareGoogleReactSvgUrl} />);

    expect(screen.getByTestId("social-button"));
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("not re-render test", () => {
  //   // const onClick= () => alert('SocialButton clicked');

  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <SocialButton iconName={ShareGoogleReactSvgUrl} label={"Test Caption"} />,
  //   ).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(false);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("disabled click test", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const testClick = jest.fn();

  //   const wrapper = mount(
  //     <SocialButton
  //       // @ts-expect-error TS(2769): No overload matches this call.
  //       iconName={ShareGoogleReactSvgUrl}
  //       label={"Test Caption"}
  //       onClick={testClick}
  //       isDisabled={true}
  //     />,
  //   );

  //   wrapper.simulate("click");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(testClick).toHaveBeenCalledTimes(0);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("click test", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const testClick = jest.fn();

  //   const wrapper = mount(
  //     <SocialButton
  //       // @ts-expect-error TS(2769): No overload matches this call.
  //       iconName={ShareGoogleReactSvgUrl}
  //       label={"Test Caption"}
  //       onClick={testClick}
  //       isDisabled={false}
  //     />,
  //   );

  //   wrapper.simulate("click");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(testClick).toHaveBeenCalledTimes(1);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <SocialButton iconName={ShareGoogleReactSvgUrl} id="testId" />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <SocialButton iconName={ShareGoogleReactSvgUrl} className="test" />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <SocialButton
  //       // @ts-expect-error TS(2769): No overload matches this call.
  //       iconName={ShareGoogleReactSvgUrl}
  //       style={{ color: "red" }}
  //     />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
