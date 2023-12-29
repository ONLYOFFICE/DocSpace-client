import React from "react";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Toast } from ".";
import { toastr } from "./sub-components/Toastr";

describe("<Textarea />", () => {
  it("renders without error", () => {
    const { container } = render(
      <Toast>{toastr.success("Some text for toast")}</Toast>,
    );

    expect(container.getElementsByClassName("Toastify").length).toBe(1);
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<Toast id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<Toast className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });
});
