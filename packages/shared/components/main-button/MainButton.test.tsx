import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MainButton } from "./MainButton";

describe("<MainButton />", () => {
  it("renders without error", () => {
    render(
      <MainButton text="Button" isDisabled={false} isDropdown model={[]} />,
    );

    expect(screen.getByTestId("main-button")).toBeInTheDocument();
  });

  // it("accepts id", () => {
  //   const wrapper = mount(
  //     <MainButton
  //       text="Button"
  //       isDisabled={false}
  //       isDropdown={true}
  //       id="testId"
  //     >
  //       <div>Some button</div>

  //       <Button label="Some button" />
  //     </MainButton>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     <MainButton
  //       text="Button"
  //       isDisabled={false}
  //       isDropdown={true}
  //       className="test"
  //     >
  //       <div>Some button</div>

  //       <Button label="Some button" />
  //     </MainButton>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <MainButton
  //       text="Button"
  //       isDisabled={false}
  //       isDropdown={true}
  //       style={{ color: "red" }}
  //     >
  //       <div>Some button</div>

  //       <Button label="Some button" />
  //     </MainButton>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
