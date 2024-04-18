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

import NavLogoReactSvgUrl from "PUBLIC_DIR/images/nav.logo.react.svg?url";

import { DropDownItem } from "./DropDownItem";

const baseProps = {
  isSeparator: false,
  isHeader: false,
  tabIndex: -1,
  label: "test",
  disabled: false,
  icon: NavLogoReactSvgUrl,
  noHover: false,
  onClick: jest.fn(),
};

describe("<DropDownItem />", () => {
  it("renders without error", () => {
    render(<DropDownItem {...baseProps} />);

    expect(screen.getByTestId("drop-down-item")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("check disabled props", () => {
  //   const wrapper = mount(<DropDownItem {...baseProps} disabled={true} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("disabled")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("check isSeparator props", () => {
  //   const wrapper = mount(<DropDownItem {...baseProps} isSeparator={true} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isSeparator")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("check isHeader props", () => {
  //   const wrapper = mount(<DropDownItem {...baseProps} isHeader={true} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isHeader")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("check noHover props", () => {
  //   const wrapper = mount(<DropDownItem {...baseProps} noHover={true} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("noHover")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("causes function onClick()", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onClick = jest.fn();

  //   const wrapper = shallow(
  //     <DropDownItem id="test" {...baseProps} onClick={onClick} />
  //   );

  //   wrapper.find("#test").simulate("click");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(onClick).toHaveBeenCalled();
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render without child", () => {
  //   const wrapper = shallow(<DropDownItem>test</DropDownItem>);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props.children).toEqual(undefined);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(<DropDownItem {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(<DropDownItem {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <DropDownItem {...baseProps} style={{ color: "red" }} />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
