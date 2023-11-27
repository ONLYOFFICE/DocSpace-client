import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount } from "enzyme";
import CatalogItem from ".";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.fold... Remove this comment to see the full error message
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/catalog.tras... Remove this comment to see the full error message
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";

const baseProps = {
  icon: CatalogFolderReactSvgUrl,
  text: "Documents",
  showText: true,
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onClick: () => jest.fn(),
  showInitial: true,
  showBadge: true,
  isEndOfBlock: true,
  labelBadge: "2",
  iconBadge: CatalogTrashReactSvgUrl,
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onClickBadge: () => jest.fn(),
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<CatalogItem />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<CatalogItem {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render without text", () => {
    const wrapper = mount(<CatalogItem {...baseProps} text="My profile" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("text")).toEqual("My profile");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render without text", () => {
    const wrapper = mount(<CatalogItem {...baseProps} text="My profile" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("text")).toEqual("My profile");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render how not end of block", () => {
    const wrapper = mount(<CatalogItem {...baseProps} isEndOfBlock={false} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("isEndOfBlock")).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render without badge", () => {
    const wrapper = mount(<CatalogItem {...baseProps} showBadge={false} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("showBadge")).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render without initial", () => {
    const wrapper = mount(<CatalogItem {...baseProps} showInitial={false} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("showInitial")).toEqual(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render without icon badge", () => {
    const wrapper = mount(<CatalogItem {...baseProps} iconBadge="" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("iconBadge")).toEqual("");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render without label badge and icon badge", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ iconBadge: string; iconLabel: string; icon... Remove this comment to see the full error message
      <CatalogItem {...baseProps} iconBadge="" iconLabel="" />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("iconBadge")).toEqual("");
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("iconLabel")).toEqual("");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("render without icon", () => {
    const wrapper = mount(<CatalogItem {...baseProps} icon="" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("icon")).toEqual("");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    const wrapper = mount(<CatalogItem {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    const wrapper = mount(<CatalogItem {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      <CatalogItem {...baseProps} style={{ width: "100px" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("width", "100px");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("trigger click", () => {
    const wrapper = mount(
      <CatalogItem {...baseProps} style={{ width: "100px" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.simulate("click"));
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("trigger update", () => {
    const wrapper = mount(
      <CatalogItem {...baseProps} style={{ width: "100px" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.simulate("click"));
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("unmount without errors", () => {
    const wrapper = mount(
      <CatalogItem {...baseProps} style={{ width: "100px" }} />
    );

    wrapper.unmount();
  });
});
