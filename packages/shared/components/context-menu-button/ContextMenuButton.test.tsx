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

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import { ContextMenuButton } from "./ContextMenuButton";
import { ContextMenuButtonDisplayType } from "./ContextMenuButton.enums";
import { globalColors } from "../../themes";

const baseData = () => [
  {
    key: "key",
    label: "label",
    onClick: jest.fn(),
  },
];

const baseProps = {
  title: "Actions",
  iconName: VerticalDotsReactSvgUrl,
  size: 16,
  color: globalColors.gray,
  getData: baseData,
  isDisabled: false,
};

describe("<ContextMenuButton />", () => {
  it("renders without error", () => {
    render(
      <ContextMenuButton
        displayType={ContextMenuButtonDisplayType.dropdown}
        {...baseProps}
      />,
    );

    expect(screen.getByTestId("context-menu-button")).toBeInTheDocument();
  });

  // it("render with full custom props", () => {
  //   const wrapper = mount(
  //     <ContextMenuButton
  //       // @ts-expect-error TS(2322): Type '{ color: string; hoverColor: string; clickCo... Remove this comment to see the full error message
  //       color="red"
  //       hoverColor="red"
  //       clickColor="red"
  //       size={20}
  //       iconName="CatalogFolderIcon"
  //       iconHoverName="CatalogFolderIcon"
  //       iconClickName="CatalogFolderIcon"
  //       isFill={true}
  //       isDisabled={true}
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onClick={() => jest.fn()}
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onMouseEnter={() => jest.fn()}
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onMouseLeave={() => jest.fn()}
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onMouseOver={() => jest.fn()}
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onMouseOut={() => jest.fn()}
  //       getData={() => [
  //         {
  //           key: "key",
  //           icon: "CatalogFolderIcon",
  //           // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //           onClick: () => jest.fn(),
  //         },
  //         {
  //           label: "CatalogFolderIcon",
  //           // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //           onClick: () => jest.fn(),
  //         },
  //         {},
  //       ]}
  //       directionX="right"
  //       opened={true}
  //     />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper).toExist();
  // });

  // it("disabled", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; title: string; iconNa... Remove this comment to see the full error message
  //     <ContextMenuButton {...baseProps} isDisabled={true} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });

  // it("not re-render", () => {
  //   const wrapper = shallow(<ContextMenuButton {...baseProps} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     wrapper.props,
  //     wrapper.state,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(false);
  // });

  // it("re-render", () => {
  //   const wrapper = shallow(<ContextMenuButton {...baseProps} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     { opened: true },
  //     wrapper.state,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });

  // it("causes function onDropDownItemClick()", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onClick = jest.fn();

  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ opened: boolean; onClick: any; title: stri... Remove this comment to see the full error message
  //     <ContextMenuButton {...baseProps} opened={true} onClick={onClick} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.onDropDownItemClick({
  //     key: "key",
  //     label: "label",
  //     onClick: onClick,
  //   });

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state("isOpen")).toBe(false);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(onClick).toHaveBeenCalled();
  // });

  // it("causes function onIconButtonClick()", () => {
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; opened: boolean; titl... Remove this comment to see the full error message
  //     <ContextMenuButton {...baseProps} isDisabled={false} opened={true} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.onIconButtonClick();

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state("isOpen")).toBe(false);
  // });

  // it("causes function onIconButtonClick() with isDisabled prop", () => {
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; opened: boolean; titl... Remove this comment to see the full error message
  //     <ContextMenuButton {...baseProps} isDisabled={true} opened={true} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.onIconButtonClick();

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state("isOpen")).toBe(true);
  // });

  // it("componentDidUpdate() state lifecycle test", () => {
  //   const wrapper = shallow(<ContextMenuButton {...baseProps} />);
  //   const instance = wrapper.instance();

  //   wrapper.setState({ isOpen: false });

  //   instance.componentDidUpdate(wrapper.props(), wrapper.state());

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state()).toBe(wrapper.state());
  // });

  // it("componentDidUpdate() props lifecycle test", () => {
  //   const wrapper = shallow(<ContextMenuButton {...baseProps} />);
  //   const instance = wrapper.instance();

  //   instance.componentDidUpdate({ opened: true }, wrapper.state());

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props()).toBe(wrapper.props());
  // });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; title: string; iconName: any; ... Remove this comment to see the full error message
  //   const wrapper = mount(<ContextMenuButton {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ className: string; title: string; iconName... Remove this comment to see the full error message
  //     <ContextMenuButton {...baseProps} className="test" />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; title: string; ... Remove this comment to see the full error message
  //     <ContextMenuButton {...baseProps} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
