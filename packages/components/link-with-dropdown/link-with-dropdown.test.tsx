import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import LinkWithDropdown from ".";

const data = [
  {
    key: "key1",
    label: "Button 1",
    onClick: () => console.log("Button1 action"),
  },
  {
    key: "key2",
    label: "Button 2",
    onClick: () => console.log("Button2 action"),
  },
  {
    key: "key3",
    isSeparator: true,
  },
  {
    key: "key4",
    label: "Button 3",
    onClick: () => console.log("Button3 action"),
  },
];

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<LinkWithDropdown />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={[]}>
        Link with dropdown
      </LinkWithDropdown>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("re-render test", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={data}>
        Link with dropdown
      </LinkWithDropdown>
    );

    const instance = wrapper.instance();
    const shouldUpdate = instance.shouldComponentUpdate(
      {
        isBold: false,
      },
      wrapper.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("re-render after changing color", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={data}>
        Link with dropdown
      </LinkWithDropdown>
    );
    const instance = wrapper.instance();

    const shouldUpdate = instance.shouldComponentUpdate(
      {
        color: "#999",
      },
      instance.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("re-render after changing dropdownType and isOpen prop", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={data}>
        Link with dropdown
      </LinkWithDropdown>
    );
    const instance = wrapper.instance();

    const shouldUpdate = instance.shouldComponentUpdate(
      {
        isOpen: true,
        dropdownType: "appearDashedAfterHover",
      },
      instance.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("re-render after changing isOpen prop", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={data}>
        Link with dropdown
      </LinkWithDropdown>
    );
    const instance = wrapper.instance();

    const shouldUpdate = instance.shouldComponentUpdate(
      {
        isOpen: true,
      },
      instance.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("not re-render", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={data}>
        Link with dropdown
      </LinkWithDropdown>
    );

    const instance = wrapper.instance();
    const shouldUpdate = instance.shouldComponentUpdate(
      instance.props,
      instance.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={[]} id="testId">
        Link with dropdown
      </LinkWithDropdown>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown
        color="#333333"
        isBold={true}
        data={[]}
        className="test"
      >
        Link with dropdown
      </LinkWithDropdown>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown
        color="#333333"
        isBold={true}
        data={[]}
        style={{ color: "red" }}
      >
        Link with dropdown
      </LinkWithDropdown>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentDidUpdate() state lifecycle test", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown
        color="#333333"
        isBold={true}
        data={[]}
        style={{ color: "red" }}
      >
        Link with dropdown
      </LinkWithDropdown>
    );
    const instance = wrapper.instance();

    wrapper.setState({ isOpen: false });

    instance.componentDidUpdate(wrapper.props(), wrapper.state());

    wrapper.setState({ isOpen: true });

    instance.componentDidUpdate(wrapper.props(), wrapper.state());

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state()).toBe(wrapper.state());
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentDidUpdate() prop lifecycle test", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown
        color="#333333"
        isBold={true}
        data={[]}
        style={{ color: "red" }}
      >
        Link with dropdown
      </LinkWithDropdown>
    );
    const instance = wrapper.instance();

    instance.componentDidUpdate(
      { isOpen: true, dropdownType: "appearDashedAfterHover" },
      wrapper.state()
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state()).toBe(wrapper.state());
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts prop dropdownType", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown
        color="#333333"
        isBold={true}
        data={[]}
        dropdownType="appearDashedAfterHover"
      >
        Link with dropdown
      </LinkWithDropdown>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("dropdownType")).toEqual("appearDashedAfterHover");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts prop isOpen", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown color="#333333" isBold={true} data={[]} isOpen>
        Link with dropdown
      </LinkWithDropdown>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isOpen")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts prop isSemitransparent", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
      <LinkWithDropdown
        color="#333333"
        isBold={true}
        data={[]}
        isSemitransparent
      >
        Link with dropdown
      </LinkWithDropdown>
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isSemitransparent")).toEqual(true);
  });
});
