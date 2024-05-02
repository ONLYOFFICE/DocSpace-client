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
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Button } from ".";
import { ButtonSize } from "./Button.enums";

const baseProps = {
  size: ButtonSize.extraSmall,
  isDisabled: false,
  label: "OK",
  onClick: () => {},
};

describe("<Button />", () => {
  test("renders without error", () => {
    render(<Button {...baseProps} />);

    expect(screen.getByTestId("button")).toBeInTheDocument();
  });

  // /* it('not re-render test', () => {
  //   const onClick = () => alert('Button clicked');

  //   const wrapper = shallow(<Button {...baseProps} onClick={onClick} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);

  //   expect(shouldUpdate).toBe(false);
  // });

  // it('re-render test by value', () => {
  //   const onClick = () => alert('Button clicked');

  //   const wrapper = shallow(<Button {...baseProps} onClick={onClick} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate({
  //     ...wrapper.props,
  //     label: "Cancel"
  //   });

  //   expect(shouldUpdate).toBe(true);
  // }); */

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; size: string; isDisabled: bool... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; size: string; isDisable... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; size: string; i... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} style={{ color: "red" }} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render with isHovered prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isHovered: true; size: string; isDisabled:... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} isHovered />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isHovered")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render with isClicked prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isClicked: true; size: string; isDisabled:... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} isClicked />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isClicked")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render with isDisabled prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isDisabled: true; size: string; label: str... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} isDisabled />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render with isLoading prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ isLoading: true; size: string; isDisabled:... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} isLoading />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isLoading")).toEqual(true);

  //   wrapper.setProps({ primary: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("primary")).toEqual(true);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isLoading")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render with various size", () => {
  //   // @ts-expect-error TS(2559): Type '{ size: string; isDisabled: boolean; label: ... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} />);

  //   wrapper.setProps({ size: "extraSmall" });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("extraSmall");

  //   wrapper.setProps({ size: "small" });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("small");

  //   wrapper.setProps({ size: "normal" });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("normal");

  //   wrapper.setProps({ size: "medium" });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("medium");

  //   wrapper.setProps({ size: "extraSmall", primary: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("extraSmall");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("primary")).toEqual(true);

  //   wrapper.setProps({ size: "normal", primary: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("normal");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("primary")).toEqual(true);

  //   wrapper.setProps({ size: "medium", primary: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("medium");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("primary")).toEqual(true);

  //   wrapper.setProps({ scale: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("scale")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render with icon", () => {
  //   const icon = <>1</>;
  //   // @ts-expect-error TS(2322): Type '{ icon: Element; size: string; isDisabled: b... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} icon={icon} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("icon")).toEqual(icon);

  //   wrapper.setProps({ size: "extraSmall", primary: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("extraSmall");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("primary")).toEqual(true);

  //   wrapper.setProps({ size: "normal", primary: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("normal");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("primary")).toEqual(true);

  //   wrapper.setProps({ size: "medium", primary: true });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("medium");
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("primary")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts minWidth", () => {
  //   // @ts-expect-error TS(2559): Type '{ size: string; isDisabled: boolean; label: ... Remove this comment to see the full error message
  //   const wrapper = mount(<Button {...baseProps} />);

  //   wrapper.setProps({ minWidth: "40px" });
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("minWidth")).toEqual("40px");
  // });
});
