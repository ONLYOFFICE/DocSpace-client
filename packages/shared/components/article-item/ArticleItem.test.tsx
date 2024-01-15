import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import ArticleFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import ArticleTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";

import { ArticleItem } from "./ArticleItem";

const baseProps = {
  icon: ArticleFolderReactSvgUrl,
  text: "Documents",
  showText: true,
  onClick: () => jest.fn(),
  showInitial: true,
  showBadge: true,
  isEndOfBlock: true,
  labelBadge: "2",
  iconBadge: ArticleTrashReactSvgUrl,
  onClickBadge: () => jest.fn(),
};

describe("<ArticleItem />", () => {
  it("renders without error", () => {
    render(<ArticleItem {...baseProps} />);

    expect(screen.getByTestId("article-item")).toBeInTheDocument();
  });

  // it("render without text", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} text="My profile" />);

  //   expect(wrapper.prop("text")).toEqual("My profile");
  // });

  // it("render without text", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} text="My profile" />);

  //   expect(wrapper.prop("text")).toEqual("My profile");
  // });

  // it("render how not end of block", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} isEndOfBlock={false} />);

  //   expect(wrapper.prop("isEndOfBlock")).toEqual(false);
  // });

  // it("render without badge", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} showBadge={false} />);

  //   expect(wrapper.prop("showBadge")).toEqual(false);
  // });

  // it("render without initial", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} showInitial={false} />);

  //   expect(wrapper.prop("showInitial")).toEqual(false);
  // });

  // it("render without icon badge", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} iconBadge="" />);

  //   expect(wrapper.prop("iconBadge")).toEqual("");
  // });

  // it("render without label badge and icon badge", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ iconBadge: string; iconLabel: string; icon... Remove this comment to see the full error message
  //     <ArticleItem {...baseProps} iconBadge="" iconLabel="" />,
  //   );

  //   expect(wrapper.prop("iconBadge")).toEqual("");
  //   expect(wrapper.prop("iconLabel")).toEqual("");
  // });

  // it("render without icon", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} icon="" />);

  //   expect(wrapper.prop("icon")).toEqual("");
  // });

  // it("accepts id", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(<ArticleItem {...baseProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <ArticleItem {...baseProps} style={{ width: "100px" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("width", "100px");
  // });

  // it("trigger click", () => {
  //   const wrapper = mount(
  //     <ArticleItem {...baseProps} style={{ width: "100px" }} />,
  //   );

  //   expect(wrapper.simulate("click"));
  // });

  // it("trigger update", () => {
  //   const wrapper = mount(
  //     <ArticleItem {...baseProps} style={{ width: "100px" }} />,
  //   );

  //   expect(wrapper.simulate("click"));
  // });

  // it("unmount without errors", () => {
  //   const wrapper = mount(
  //     <ArticleItem {...baseProps} style={{ width: "100px" }} />,
  //   );

  //   wrapper.unmount();
  // });
});
