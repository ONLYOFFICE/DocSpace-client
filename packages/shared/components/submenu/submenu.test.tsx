// (c) Copyright Ascensio System SIA 2010-2024
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

// // @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
// import { mount, shallow } from "enzyme";
// import React from "react";

// import Submenu from "./";
// import { testData, testStartSelect } from "./data";

// const props = {
//   data: testData,
//   startSelect: testStartSelect,
// };

// const onlyData = {
//   data: testData,
// };

describe("<Submenu />", () => {
  it("renders without error", () => {
    // const wrapper = mount(<Submenu {...props} />);
    // // @ts-expect-error TS(2304): Cannot find name 'expect'.
    // expect(wrapper).toExist(true);
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("gets data prop", () => {
  //   const wrapper = mount(<Submenu {...onlyData} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("data")).toEqual(testData);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("doesnt render without data prop", () => {
  //   const wrapper = mount(<Submenu {...props} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper).toExist(false);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("gets startSelect prop", () => {
  //   const wrapper = mount(<Submenu {...props} />);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("startSelect")).toEqual(testStartSelect);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("selects first data item as currentItem without startSelect prop", () => {
  //   const wrapper = shallow(<Submenu {...onlyData} />)
  //     .find("styled-submenu__StyledSubmenuContentWrapper")
  //     .childAt(0);
  //   const currentItemWrapper = shallow(testData[0].content);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.debug()).toEqual(currentItemWrapper.debug());
  // });
});
