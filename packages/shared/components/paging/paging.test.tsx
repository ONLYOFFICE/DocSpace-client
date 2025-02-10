// (c) Copyright Ascensio System SIA 2009-2025
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

// import React from "react";
// // @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
// import { mount } from "enzyme";
// import Paging from ".";

// const baseProps = {
//   previousLabel: "Previous",
//   nextLabel: "Next",
//   selectedPageItem: { label: "1 of 1" },
//   selectedCountItem: { label: "25 per page" },
//   openDirection: "bottom",
// };

describe("<Paging />", () => {
  it("renders without error", () => {
    // const wrapper = mount(<Paging {...baseProps} />);
    // // @ts-expect-error TS(2304): Cannot find name 'expect'.
    // expect(wrapper).toExist();
  });
  // it("accepts id", () => {
  //   const wrapper = mount(<Paging {...baseProps} id="testId" />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });
  // it("accepts className", () => {
  //   const wrapper = mount(<Paging {...baseProps} className="test" />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });
  // it("accepts style", () => {
  //   const wrapper = mount(<Paging {...baseProps} style={{ color: "red" }} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
