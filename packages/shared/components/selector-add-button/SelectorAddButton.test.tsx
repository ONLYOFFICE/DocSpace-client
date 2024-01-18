import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { SelectorAddButton } from "./SelectorAddButton";

const baseProps = {
  title: "Add item",
  isDisabled: false,
};

describe("<SelectorAddButton />", () => {
  it("renders without error", () => {
    render(<SelectorAddButton {...baseProps} />);

    expect(screen.getByTestId("selector-add-button")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<SelectorAddButton {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     <SelectorAddButton {...baseProps} className="test" />,
  //   );

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <SelectorAddButton {...baseProps} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
