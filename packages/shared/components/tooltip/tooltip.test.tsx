import React from "react";
import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import { Text } from "../text";

import { Tooltip } from ".";

describe("<Tooltip />", () => {
  it("renders without error", () => {
    render(
      <Tooltip>
        <Text>You tooltip text</Text>
      </Tooltip>,
    );

    expect(screen.queryByTestId("tooltip")).toBeInTheDocument();
  });

  // it("Tooltip componentDidUpdate() lifecycle test", () => {
  //   const wrapper = mount(
  //     <Tooltip>{<Text>You tooltip text</Text>}</Tooltip>,
  //   ).instance();
  //   wrapper.componentDidUpdate(wrapper.props, wrapper.state);

  //   expect(wrapper.props).toBe(wrapper.props);
  // });

  // it("Tooltip componentDidUpdate() lifecycle test", () => {
  //   const wrapper = mount(
  //     <Tooltip>{<Text>You tooltip text</Text>}</Tooltip>,
  //   ).instance();
  //   wrapper.componentDidUpdate(wrapper.props, wrapper.state);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props).toBe(wrapper.props);
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<Tooltip className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(<Tooltip style={{ color: "red" }} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
