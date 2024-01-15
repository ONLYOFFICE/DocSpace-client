import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Loader } from ".";
import { LoaderTypes } from "./Loader.enums";

const baseProps = {
  type: LoaderTypes.base,
  color: "black",
  size: "18px",
  label: "Loading",
};

describe("<Loader />", () => {
  test("renders without error", () => {
    render(<Loader {...baseProps} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("dual-ring type", () => {
  //   const wrapper = mount(<Loader {...baseProps} type="dual-ring" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("type")).toEqual("dual-ring");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("rombs type", () => {
  //   const wrapper = mount(<Loader {...baseProps} type="rombs" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("type")).toEqual("rombs");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(<Loader {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(<Loader {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(<Loader {...baseProps} style={{ color: "red" }} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
