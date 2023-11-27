import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import ContextMenuButton from ".";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/vertical-dot... Remove this comment to see the full error message
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";

const baseData = () => [
  {
    key: "key",
    label: "label",
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    onClick: () => jest.fn(),
  },
];

const baseProps = {
  title: "Actions",
  iconName: VerticalDotsReactSvgUrl,
  size: 16,
  color: "#A3A9AE",
  getData: baseData,
  isDisabled: false,
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<ContextMenuButton />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<ContextMenuButton {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render with full custom props", () => {
    const wrapper = mount(
      <ContextMenuButton
        // @ts-expect-error TS(2322): Type '{ color: string; hoverColor: string; clickCo... Remove this comment to see the full error message
        color="red"
        hoverColor="red"
        clickColor="red"
        size={20}
        iconName="CatalogFolderIcon"
        iconHoverName="CatalogFolderIcon"
        iconClickName="CatalogFolderIcon"
        isFill={true}
        isDisabled={true}
        // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
        onClick={() => jest.fn()}
        // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
        onMouseEnter={() => jest.fn()}
        // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
        onMouseLeave={() => jest.fn()}
        // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
        onMouseOver={() => jest.fn()}
        // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
        onMouseOut={() => jest.fn()}
        getData={() => [
          {
            key: "key",
            icon: "CatalogFolderIcon",
            // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
            onClick: () => jest.fn(),
          },
          {
            label: "CatalogFolderIcon",
            // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
            onClick: () => jest.fn(),
          },
          {},
        ]}
        directionX="right"
        opened={true}
      />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("disabled", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; title: string; iconNa... Remove this comment to see the full error message
      <ContextMenuButton {...baseProps} isDisabled={true} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isDisabled")).toEqual(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("not re-render", () => {
    const wrapper = shallow(<ContextMenuButton {...baseProps} />).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate(
      wrapper.props,
      wrapper.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("re-render", () => {
    const wrapper = shallow(<ContextMenuButton {...baseProps} />).instance();

    const shouldUpdate = wrapper.shouldComponentUpdate(
      { opened: true },
      wrapper.state
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(shouldUpdate).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onDropDownItemClick()", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onClick = jest.fn();

    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ opened: boolean; onClick: any; title: stri... Remove this comment to see the full error message
      <ContextMenuButton {...baseProps} opened={true} onClick={onClick} />
    );
    const instance = wrapper.instance();

    instance.onDropDownItemClick({
      key: "key",
      label: "label",
      onClick: onClick,
    });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(onClick).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onIconButtonClick()", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; opened: boolean; titl... Remove this comment to see the full error message
      <ContextMenuButton {...baseProps} isDisabled={false} opened={true} />
    );
    const instance = wrapper.instance();

    instance.onIconButtonClick();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("causes function onIconButtonClick() with isDisabled prop", () => {
    const wrapper = shallow(
      // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; opened: boolean; titl... Remove this comment to see the full error message
      <ContextMenuButton {...baseProps} isDisabled={true} opened={true} />
    );
    const instance = wrapper.instance();

    instance.onIconButtonClick();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state("isOpen")).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentDidUpdate() state lifecycle test", () => {
    const wrapper = shallow(<ContextMenuButton {...baseProps} />);
    const instance = wrapper.instance();

    wrapper.setState({ isOpen: false });

    instance.componentDidUpdate(wrapper.props(), wrapper.state());

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state()).toBe(wrapper.state());
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("componentDidUpdate() props lifecycle test", () => {
    const wrapper = shallow(<ContextMenuButton {...baseProps} />);
    const instance = wrapper.instance();

    instance.componentDidUpdate({ opened: true }, wrapper.state());

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.props()).toBe(wrapper.props());
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; title: string; iconName: any; ... Remove this comment to see the full error message
    const wrapper = mount(<ContextMenuButton {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ className: string; title: string; iconName... Remove this comment to see the full error message
      <ContextMenuButton {...baseProps} className="test" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ style: { color: string; }; title: string; ... Remove this comment to see the full error message
      <ContextMenuButton {...baseProps} style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
