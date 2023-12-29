import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Scrollbar } from ".";

describe("<Scrollbar />", () => {
  it("<Scrollbar />: renders without error", () => {
    render(<Scrollbar>Some content</Scrollbar>);

    expect(screen.queryByTestId("scrollbar")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<Scrollbar id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<Scrollbar className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(<Scrollbar style={{ color: "red" }} />);

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
