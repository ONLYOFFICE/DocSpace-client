import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ViewSelector } from "./ViewSelector";

const baseProps = {
  isDisabled: false,
  isFilter: false,
  onChangeView: jest.fn(),
  viewAs: "row",
  viewSettings: [
    {
      value: "row",
      icon: "",
    },
    {
      value: "tile",
      icon: "",
    },
    {
      value: "some",
      icon: "",
    },
  ],
};

describe("<ViewSelector />", () => {
  it("renders without error", () => {
    render(<ViewSelector {...baseProps} />);

    expect(screen.getByTestId("view-selector")).toBeInTheDocument();
  });

  // it("render with disabled", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ isDisabled: true; isFilter: boolean; onCha... Remove this comment to see the full error message
  //     <ViewSelector onClick={jest.fn()} {...baseProps} isDisabled={true} />,
  //   );
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper).toExist();
  // });

  // it("id, className, style is exist", () => {
  //   const wrapper = mount(
  //     <ViewSelector
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ id: string; className: string; style: { co... Remove this comment to see the full error message
  //       id="testId"
  //       className="test"
  //       style={{ color: "red" }}
  //     />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // it("accepts isDisabled", () => {
  //   const wrapper = mount(<ViewSelector {...baseProps} isDisabled />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });

  // it("accepts isFilter", () => {
  //   const wrapper = mount(<ViewSelector {...baseProps} isFilter />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isFilter")).toEqual(true);
  // });

  // it("accepts viewAs", () => {
  //   const wrapper = mount(<ViewSelector {...baseProps} viewAs="tile" />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("viewAs")).toEqual("tile");
  // });
});
