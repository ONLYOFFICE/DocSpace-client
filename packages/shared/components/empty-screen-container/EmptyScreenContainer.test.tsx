import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { EmptyScreenContainer } from "./EmptyScreenContainer";

const baseProps = {
  imageSrc: "empty_screen_filter.png",
  imageAlt: "Empty Screen Filter image",
  headerText: "No results matching your search could be found",
  descriptionText: "No results matching your search could be found",
  buttons: <a href="/">Go to home</a>,
};

describe("<EmptyScreenContainer />", () => {
  it("renders without error", () => {
    render(<EmptyScreenContainer {...baseProps} />);

    expect(screen.getByTestId("empty-screen-container")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(<EmptyScreenContainer {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     <EmptyScreenContainer {...baseProps} className="test" />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <EmptyScreenContainer {...baseProps} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
