import React from "react";

import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ContextMenu } from ".";

describe("<ContextMenu />", () => {
  it("renders without error", () => {
    render(<ContextMenu model={[]} />);

    expect(screen.getByTestId("context-menu")).toBeInTheDocument();
  });

  /*   it("componentWillUnmount() test unmount", () => {
    const wrapper = mount(<ContextMenu {...baseProps} />);

    wrapper.unmount();

    expect(wrapper).toEqual(wrapper);
  });

  it("simulate handleClick() with change state to close context menu", () => {
    const wrapper = mount(
      <div id="container">
        <ContextMenu {...baseProps} id="container" />
      </div>
    );
    const instance = wrapper.find(ContextMenu).instance();

    wrapper.find(ContextMenu).setState({ visible: true });
    instance.handleClick(new Event("click", { target: null }));

    expect(wrapper.find(ContextMenu).state("visible")).toEqual(false);
  });

  it("render with options", () => {
    const options = [
      { label: "test" },
      { key: 2, label: "test" },
      false,
      { key: 4, label: "test" },
    ];

    const wrapper = mount(<ContextMenu options={options} />);
    wrapper.setState({ visible: true });

    expect(wrapper.props().options).toEqual(options);
  });

  it("simulate handleContextMenu(e) to close context menu", () => {
    const wrapper = mount(<ContextMenu {...baseProps} />);
    const instance = wrapper.instance();

    instance.handleContextMenu(new Event("click", { target: null }));

    expect(wrapper.state("visible")).toEqual(true);
  });

  it("accepts id", () => {
    const wrapper = mount(<ContextMenu {...baseProps} id="testId" />);

    expect(wrapper.prop("id")).toEqual("testId");
  });

  it("accepts className", () => {
    const wrapper = mount(<ContextMenu {...baseProps} className="test" />);

    expect(wrapper.prop("className")).toEqual("test");
  });

  it("accepts style", () => {
    const wrapper = mount(
      <ContextMenu
        {...baseProps}
        style={{ color: "red" }}
        withBackdrop={false}
      />
    );

    wrapper.setState({ visible: true });

    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  }); */
});
