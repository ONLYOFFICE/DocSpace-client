import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { TextInput } from "./TextInput";
import { InputSize, InputType } from "./TextInput.enums";

describe("<TextInput />", () => {
  it("renders without error", () => {
    render(
      <TextInput
        value="text"
        size={InputSize.base}
        type={InputType.text}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByTestId("text-input")).toBeInTheDocument();
  });

  //
  // it("not re-render test", () => {
  //
  //   const onChange = jest.fn();

  //   const wrapper = shallow(
  //     <TextInput value="text" onChange={onChange} />
  //   ).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(false);
  // });

  //
  // it("re-render test by value", () => {
  //
  //   const onChange = jest.fn();

  //   const wrapper = shallow(
  //     <TextInput value="text" onChange={onChange} />
  //   ).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate({
  //     ...wrapper.props,
  //     value: "another text",
  //   });

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });

  //
  // it("accepts id", () => {
  //   const wrapper = mount(
  //
  //     <TextInput value="text" onChange={jest.fn()} id="testId" />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  //
  // it("accepts className", () => {
  //   const wrapper = mount(
  //
  //     <TextInput value="text" onChange={jest.fn()} className="test" />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  //
  // it("accepts style", () => {
  //   const wrapper = mount(
  //
  //     <TextInput value="text" onChange={jest.fn()} style={{ color: "red" }} />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
