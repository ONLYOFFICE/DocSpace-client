import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { HelpButton } from "./HelpButton";

const tooltipContent = "You tooltip content";
describe("<HelpButton />", () => {
  it("HelpButton renders without error", () => {
    render(<HelpButton tooltipContent={tooltipContent} />);
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  // it("HelpButton componentWillUnmount  test", () => {
  //   const wrapper = mount(<HelpButton tooltipContent={tooltipContent} />);
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const componentWillUnmount = jest.spyOn(
  //     wrapper.instance(),
  //     "componentWillUnmount",
  //   );
  //   wrapper.unmount();
  //   expect(componentWillUnmount).toHaveBeenCalled();
  // });

  // it("HelpButton test afterHide function", () => {
  //   const wrapper = shallow(
  //     <HelpButton tooltipContent={tooltipContent} />,
  //   ).instance();
  //   wrapper.afterHide();
  //   expect(wrapper.state.hideTooltip).toEqual(false);

  //   wrapper.setState({ hideTooltip: false });
  //   wrapper.afterHide();
  //   expect(wrapper.state.hideTooltip).toEqual(false);
  // });

  // it("accepts id", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ tooltipContent: string; id: string; }' is ... Remove this comment to see the full error message
  //     <HelpButton tooltipContent={tooltipContent} id="testId" />,
  //   );

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ tooltipContent: string; className: string;... Remove this comment to see the full error message
  //     <HelpButton tooltipContent={tooltipContent} className="test" />,
  //   );

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ tooltipContent: string; style: { color: st... Remove this comment to see the full error message
  //     <HelpButton tooltipContent={tooltipContent} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
