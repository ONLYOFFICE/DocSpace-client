import React from "react";

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { SelectedItem } from "./SelectedItem";

const baseProps = {
  label: "sample text",
  onClose: () => jest.fn(),
  propKey: "",
};

describe("<SelectedItem />", () => {
  it("renders without error", () => {
    render(<SelectedItem {...baseProps} />);

    expect(screen.getByTestId("selected-item")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<SelectedItem {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<SelectedItem {...baseProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <SelectedItem {...baseProps} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
