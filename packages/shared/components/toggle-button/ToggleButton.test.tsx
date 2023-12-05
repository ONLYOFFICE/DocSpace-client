import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { ToggleButton } from "./ToggleButton";

describe("<ToggleButton />", () => {
  test("renders without error", () => {
    render(<ToggleButton isChecked={false} onChange={() => {}} label="Text" />);

    expect(screen.getByTestId("toggle-button")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("Toggle button componentDidUpdate() test", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ isChecked: boolean; onChange: () => any; }... Remove this comment to see the full error message
  //     <ToggleButton isChecked={false} onChange={() => jest.fn()} />
  //   ).instance();
  //   wrapper.componentDidUpdate(wrapper.props);

  //   const wrapper2 = mount(
  //     // @ts-expect-error TS(2322): Type '{ isChecked: boolean; onChange: () => any; }... Remove this comment to see the full error message
  //     <ToggleButton isChecked={true} onChange={() => jest.fn()} />
  //   ).instance();
  //   wrapper2.componentDidUpdate(wrapper2.props);

  //   const wrapper3 = shallow(
  //     // @ts-expect-error TS(2322): Type '{ isChecked: boolean; onChange: () => any; }... Remove this comment to see the full error message
  //     <ToggleButton isChecked={false} onChange={() => jest.fn()} />
  //   );
  //   wrapper3.setState({ isOpen: true });
  //   wrapper3.instance().componentDidUpdate(wrapper3.props());

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props).toBe(wrapper.props);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state.checked).toBe(wrapper.props.isChecked);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper2.props).toBe(wrapper2.props);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper2.state.checked).toBe(wrapper2.props.isChecked);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper3.state()).toBe(wrapper3.state());
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(
  //     <ToggleButton
  //       // @ts-expect-error TS(2322): Type '{ label: string; onChange: () => any; isChec... Remove this comment to see the full error message
  //       label="text"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={() => jest.fn()}
  //       isChecked={false}
  //       id="testId"
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(
  //     <ToggleButton
  //       // @ts-expect-error TS(2322): Type '{ label: string; onChange: () => any; isChec... Remove this comment to see the full error message
  //       label="text"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={() => jest.fn()}
  //       isChecked={false}
  //       className="test"
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <ToggleButton
  //       // @ts-expect-error TS(2322): Type '{ label: string; onChange: () => any; isChec... Remove this comment to see the full error message
  //       label="text"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={() => jest.fn()}
  //       isChecked={false}
  //       style={{ color: "red" }}
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
