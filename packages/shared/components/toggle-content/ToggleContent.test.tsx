import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ToggleContent } from "./ToggleContent";

describe("<ToggleContent />", () => {
  it("renders without error", () => {
    render(
      <ToggleContent isOpen={false} label="test">
        <span>Some text</span>
        <div>asd</div>
      </ToggleContent>,
    );

    expect(screen.getByTestId("toggle-content")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<ToggleContent id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; }' is not assignable to... Remove this comment to see the full error message
  //   const wrapper = mount(<ToggleContent className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; }' is not assig... Remove this comment to see the full error message
  //   const wrapper = mount(<ToggleContent style={{ color: "red" }} />);

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
