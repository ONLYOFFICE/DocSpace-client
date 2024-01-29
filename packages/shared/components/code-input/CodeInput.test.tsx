import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { CodeInput } from "./CodeInput";

describe("<CodeInput />", () => {
  it("renders without error", () => {
    render(<CodeInput onSubmit={jest.fn()} />);

    expect(screen.getByTestId("code-input")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const wrapper = mount(<CodeInput onSubmit={jest.fn()} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const wrapper = mount(<CodeInput onSubmit={jest.fn()} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //     <CodeInput onSubmit={jest.fn()} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
