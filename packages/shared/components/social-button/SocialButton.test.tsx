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
import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";

import ShareGoogleReactSvgUrl from "PUBLIC_DIR/images/share.google.react.svg?url";
import { renderWithTheme } from "../../utils/render-with-theme";

import { SocialButton } from "./SocialButton";

describe("<SocialButton />", () => {
  it("renders without error", () => {
    renderWithTheme(<SocialButton iconName={ShareGoogleReactSvgUrl} />);

    expect(screen.getByTestId("social-button"));
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("not re-render test", () => {
  //   // const onClick= () => alert('SocialButton clicked');

  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <SocialButton iconName={ShareGoogleReactSvgUrl} label={"Test Caption"} />,
  //   ).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(wrapper.props);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(false);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("disabled click test", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const testClick = jest.fn();

  //   const wrapper = mount(
  //     <SocialButton
  //       // @ts-expect-error TS(2769): No overload matches this call.
  //       iconName={ShareGoogleReactSvgUrl}
  //       label={"Test Caption"}
  //       onClick={testClick}
  //       isDisabled={true}
  //     />,
  //   );

  //   wrapper.simulate("click");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(testClick).toHaveBeenCalledTimes(0);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("click test", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const testClick = jest.fn();

  //   const wrapper = mount(
  //     <SocialButton
  //       // @ts-expect-error TS(2769): No overload matches this call.
  //       iconName={ShareGoogleReactSvgUrl}
  //       label={"Test Caption"}
  //       onClick={testClick}
  //       isDisabled={false}
  //     />,
  //   );

  //   wrapper.simulate("click");

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(testClick).toHaveBeenCalledTimes(1);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <SocialButton iconName={ShareGoogleReactSvgUrl} id="testId" />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <SocialButton iconName={ShareGoogleReactSvgUrl} className="test" />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <SocialButton
  //       // @ts-expect-error TS(2769): No overload matches this call.
  //       iconName={ShareGoogleReactSvgUrl}
  //       style={{ color: "red" }}
  //     />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
