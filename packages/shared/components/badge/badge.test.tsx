import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Badge } from "./Badge";

describe("<Badge />", () => {
  it("renders without error", () => {
    render(<Badge />);

    expect(screen.getByTestId("badge")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("displays label", () => {
  //   const wrapper = mount(<Badge label="10" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("label")).toBe("10");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("call onClick()", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onClick = jest.fn();
  //   const wrapper = mount(<Badge onClick={onClick} />);

  //   wrapper.simulate("click");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(onClick).toBeCalled();
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("call onClick() without wrapper", () => {
  //   const wrapper = mount(<Badge />);

  //   wrapper.simulate("click");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper).toExist();
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(<Badge id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(<Badge className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(<Badge style={{ color: "red" }} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
