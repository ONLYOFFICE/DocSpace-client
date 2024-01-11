import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Textarea } from "./Textarea";

describe("<Textarea />", () => {
  it("renders without error", () => {
    render(
      <Textarea placeholder="Add comment" onChange={jest.fn()} value="value" />,
    );

    expect(screen.getByTestId("textarea")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(
  //     <Textarea
  //       placeholder="Add comment"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={jest.fn()}
  //       value="value"
  //       className="test"
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <Textarea
  //       placeholder="Add comment"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={jest.fn()}
  //       value="value"
  //       style={{ color: "red" }}
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts fontSize", () => {
  //   const wrapper = mount(
  //     <Textarea
  //       placeholder="Add comment"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={jest.fn()}
  //       value="value"
  //       className="test"
  //       fontSize={12}
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("fontSize")).toEqual(12);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts heightTextArea", () => {
  //   const wrapper = mount(
  //     <Textarea
  //       placeholder="Add comment"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={jest.fn()}
  //       value="value"
  //       className="test"
  //       heightTextArea={54}
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("heightTextArea")).toEqual(54);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts copyInfoText", () => {
  //   const wrapper = mount(
  //     <Textarea
  //       placeholder="Add comment"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={jest.fn()}
  //       value="value"
  //       className="test"
  //       copyInfoText='text was copied'
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("copyInfoText")).toEqual('text was copied');
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts isJSONField", () => {
  //   const wrapper = mount(
  //     <Textarea
  //       placeholder="Add comment"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={jest.fn()}
  //       value="value"
  //       className="test"
  //       isJSONField={true}
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isJSONField")).toEqual(true);
  // });
});
