// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import ArticleFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import ArticleTrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.trash.react.svg?url";

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
