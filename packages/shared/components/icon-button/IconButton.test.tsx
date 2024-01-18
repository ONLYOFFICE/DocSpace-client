import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import { IconButton } from ".";

const baseProps = {
  size: 25,
  isDisabled: false,
  iconName: SearchReactSvgUrl,
  isFill: true,
};

describe("<IconButton />", () => {
  it("renders without error", () => {
    render(<IconButton {...baseProps} />);

    expect(screen.getByTestId("icon-button"));
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; size: string; isDisabled: bool... Remove this comment to see the full error message
  //   const wrapper = mount(<IconButton {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; size: string; isDisable... Remove this comment to see the full error message
  //   const wrapper = mount(<IconButton {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; size: string; i... Remove this comment to see the full error message
  //     <IconButton {...baseProps} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
