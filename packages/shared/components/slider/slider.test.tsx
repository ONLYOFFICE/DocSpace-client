import React from "react";

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Slider } from "./Slider";

describe("<Slider />", () => {
  it("renders without error", () => {
    render(<Slider min={0} max={0} value={0} />);

    expect(screen.getByTestId("slider")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<Slider id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<Slider className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });
});
