import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RadioButtonGroup } from "./RadioButtonGroup";

const baseProps = {
  name: "fruits",
  selected: "banana",
  options: [
    { value: "apple", label: "Sweet apple" },
    { value: "banana", label: "Banana" },
    { value: "Mandarin" },
  ],
};

describe("<RadioButtonGroup />", () => {
  it("renders without error", () => {
    render(<RadioButtonGroup {...baseProps} onClick={() => {}} />);

    expect(screen.getByTestId("radio-button-group")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; name: string; selected: string... Remove this comment to see the full error message
  //   const wrapper = mount(<RadioButtonGroup {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; name: string; selected:... Remove this comment to see the full error message
  //   const wrapper = mount(<RadioButtonGroup {...baseProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; name: string; s... Remove this comment to see the full error message
  //     <RadioButtonGroup {...baseProps} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // it("accepts isDisabled prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isDisabled: true; name: string; selected: ... Remove this comment to see the full error message
  //   const wrapper = mount(<RadioButtonGroup {...baseProps} isDisabled />);

  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });
});
