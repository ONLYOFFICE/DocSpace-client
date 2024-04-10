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

import { Avatar } from ".";
import { AvatarRole, AvatarSize } from "./Avatar.enums";

const baseProps = {
  size: AvatarSize.max,
  role: AvatarRole.user,
  source: "",
  editLabel: "Edit",
  userName: "Demo User",
  editing: false,

  editAction: () => jest.fn(),
};

describe("<Avatar />", () => {
  test("correct render", () => {
    render(<Avatar {...baseProps} />);

    expect(screen.queryByTestId("avatar")).toBeInTheDocument();
  });
});

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render owner avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} role="owner" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("role")).toEqual("owner");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render guest avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} role="guest" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("role")).toEqual("guest");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render big avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="big" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("big");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render medium avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="medium" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("medium");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render small avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="small" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("small");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render min avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} size="min" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("size")).toEqual("min");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render empty avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} userName="" source="" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("userName")).toEqual("");
//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("source")).toEqual("");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render source avatar", () => {
//   const wrapper = mount(
//     <Avatar {...baseProps} userName="Demo User" source="demo" />,
//   );

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("userName")).toEqual("Demo User");
//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("source")).toEqual("demo");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render initials avatar", () => {
//   const wrapper = mount(
//     <Avatar {...baseProps} userName="Demo User" source="" />,
//   );

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("userName")).toEqual("Demo User");
//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("source")).toEqual("");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("render editing avatar", () => {
//   const wrapper = mount(<Avatar {...baseProps} editing />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("editing")).toEqual(true);
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("accepts id", () => {
//   const wrapper = mount(<Avatar {...baseProps} id="testId" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("id")).toEqual("testId");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("accepts className", () => {
//   const wrapper = mount(<Avatar {...baseProps} className="test" />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.prop("className")).toEqual("test");
// });

// // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
// it("accepts style", () => {
//   const wrapper = mount(<Avatar {...baseProps} style={{ width: "100px" }} />);

//   // @ts-expect-error TS(2304): Cannot find name 'expect'.
//   expect(wrapper.getDOMNode().style).toHaveProperty("width", "100px");
// });
// });
