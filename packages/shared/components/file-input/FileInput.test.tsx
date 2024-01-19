import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { InputSize } from "../text-input";
import { FileInput } from "./FileInput";

describe("<FileInput />", () => {
  it("renders without error", () => {
    render(<FileInput size={InputSize.base} onInput={jest.fn()} />);

    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  // it("not re-render test", () => {
  //   const onInput = jest.fn();

  //   const wrapper = shallow(<FileInput onInput={onInput} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     wrapper.props,
  //     wrapper.state,
  //   );

  //   expect(shouldUpdate).toBe(false);
  // });

  // it("accepts id", () => {
  //   const wrapper = mount(<FileInput onInput={jest.fn()} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<FileInput onInput={jest.fn()} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <FileInput onInput={jest.fn()} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
