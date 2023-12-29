import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Tag } from "./Tag";

const baseProps = {
  tag: "script",
  label: "Script",
  isNewTag: false,
  isDisabled: false,
  onDelete: () => {},
  onClick: () => {},

  tagMaxWidth: "160px",
};

describe("<Tag />", () => {
  it("renders without error", () => {
    render(<Tag {...baseProps} />);

    expect(screen.getByTestId("tag")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<Tag {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<Tag {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });
});
