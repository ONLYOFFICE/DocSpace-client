import React from "react";

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RowContainer } from "./RowContainer";

const baseProps = {
  manualHeight: "500px",
};

describe("<RowContainer />", () => {
  it("renders without error", () => {
    render(
      <RowContainer
        {...baseProps}
        useReactWindow
        onScroll={() => {}}
        fetchMoreFiles={async () => {}}
        hasMoreFiles
        itemCount={2}
        filesLength={2}
        itemHeight={50}
      >
        <span>Demo</span>
        <span>Demo</span>
      </RowContainer>,
    );

    expect(screen.getByTestId("row-container")).toBeInTheDocument();
  });

  // it("stop event on context click", () => {
  //   const wrapper = shallow(
  //     <RowContainer>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   const event = { preventDefault: () => {} };

  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   jest.spyOn(event, "preventDefault");

  //   wrapper.simulate("contextmenu", event);

  //   expect(event.preventDefault).not.toBeCalled();
  // });

  // it("renders like list", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer useReactWindow={false}>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper).toExist();
  //   expect(wrapper.getDOMNode().style).toHaveProperty("height", "");
  // });

  // it("renders without manualHeight", () => {
  //   const wrapper = mount(
  //     <RowContainer>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper).toExist();
  // });

  // it("render with normal rows", () => {
  //   const wrapper = mount(
  //     <RowContainer {...baseProps}>
  //       // @ts-expect-error TS(2322): Type '{ children: string; contextOptions: { key: s... Remove this comment to see the full error message
  //       <div contextOptions={[{ key: "1", label: "test" }]}>test</div>
  //     </RowContainer>
  //   );

  //   expect(wrapper).toExist();
  // });

  // it("accepts id", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer {...baseProps} id="testId">
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer {...baseProps} className="test">
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer {...baseProps} style={{ color: "red" }}>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
