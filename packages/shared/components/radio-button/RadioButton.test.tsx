import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RadioButton } from "./RadioButton";

const baseProps = {
  name: "fruits",
  value: "apple",
  label: "Sweet apple",
};

describe("<RadioButton />", () => {
  it("renders without error", () => {
    render(<RadioButton {...baseProps} onChange={() => {}} />);

    expect(screen.getByTestId("radio-button")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; name: string; value: string; l... Remove this comment to see the full error message
  //   const wrapper = mount(<RadioButton {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; name: string; value: st... Remove this comment to see the full error message
  //   const wrapper = mount(<RadioButton {...baseProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; name: string; v... Remove this comment to see the full error message
  //     <RadioButton {...baseProps} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // it("accepts isDisabled prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isDisabled: true; name: string; value: str... Remove this comment to see the full error message
  //   const wrapper = mount(<RadioButton {...baseProps} isDisabled />);

  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });
});
