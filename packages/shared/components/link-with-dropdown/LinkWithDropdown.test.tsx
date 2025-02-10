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
// import { mount, shallow } from "enzyme";
// import LinkWithDropdown from ".";

// const data = [
//   {
//     key: "key1",
//     label: "Button 1",
//     onClick: () => console.log("Button1 action"),
//   },
//   {
//     key: "key2",
//     label: "Button 2",
//     onClick: () => console.log("Button2 action"),
//   },
//   {
//     key: "key3",
//     isSeparator: true,
//   },
//   {
//     key: "key4",
//     label: "Button 3",
//     onClick: () => console.log("Button3 action"),
//   },
// ];

describe("<LinkWithDropdown />", () => {
  it("renders without error", () => {
    // const wrapper = mount(
    //   <LinkWithDropdown isBold={true} data={[]}>
    //     Link with dropdown
    //   </LinkWithDropdown>
    // );
    // // @ts-expect-error TS(2304): Cannot find name 'expect'.
    // expect(wrapper).toExist();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("re-render test", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown isBold={true} data={data}>
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   const instance = wrapper.instance();
  //   const shouldUpdate = instance.shouldComponentUpdate(
  //     {
  //       isBold: false,
  //     },
  //     wrapper.state
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("re-render after changing color", () => {
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown isBold={true} data={data}>
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );
  //   const instance = wrapper.instance();

  //   const shouldUpdate = instance.shouldComponentUpdate(
  //     {
  //       color: "",
  //     },
  //     instance.state
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("re-render after changing dropdownType and isOpen prop", () => {
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown isBold={true} data={data}>
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );
  //   const instance = wrapper.instance();

  //   const shouldUpdate = instance.shouldComponentUpdate(
  //     {
  //       isOpen: true,
  //       dropdownType: "appearDashedAfterHover",
  //     },
  //     instance.state
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("re-render after changing isOpen prop", () => {
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown isBold={true} data={data}>
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );
  //   const instance = wrapper.instance();

  //   const shouldUpdate = instance.shouldComponentUpdate(
  //     {
  //       isOpen: true,
  //     },
  //     instance.state
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("not re-render", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown isBold={true} data={data}>
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   const instance = wrapper.instance();
  //   const shouldUpdate = instance.shouldComponentUpdate(
  //     instance.props,
  //     instance.state
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(false);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown isBold={true} data={[]} id="testId">
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown
  //       isBold={true}
  //       data={[]}
  //       className="test"
  //     >
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown
  //       isBold={true}
  //       data={[]}
  //       style={{ color: "red" }}
  //     >
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("componentDidUpdate() state lifecycle test", () => {
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown
  //       isBold={true}
  //       data={[]}
  //       style={{ color: "red" }}
  //     >
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );
  //   const instance = wrapper.instance();

  //   wrapper.setState({ isOpen: false });

  //   instance.componentDidUpdate(wrapper.props(), wrapper.state());

  //   wrapper.setState({ isOpen: true });

  //   instance.componentDidUpdate(wrapper.props(), wrapper.state());

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state()).toBe(wrapper.state());
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("componentDidUpdate() prop lifecycle test", () => {
  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown
  //       isBold={true}
  //       data={[]}
  //       style={{ color: "red" }}
  //     >
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );
  //   const instance = wrapper.instance();

  //   instance.componentDidUpdate(
  //     { isOpen: true, dropdownType: "appearDashedAfterHover" },
  //     wrapper.state()
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state()).toBe(wrapper.state());
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts prop dropdownType", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown
  //       isBold={true}
  //       data={[]}
  //       dropdownType="appearDashedAfterHover"
  //     >
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("dropdownType")).toEqual("appearDashedAfterHover");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts prop isOpen", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown isBold={true} data={[]} isOpen>
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isOpen")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts prop isSemitransparent", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ children: string; color: string; isBold: b... Remove this comment to see the full error message
  //     <LinkWithDropdown
  //       isBold={true}
  //       data={[]}
  //       isSemitransparent
  //     >
  //       Link with dropdown
  //     </LinkWithDropdown>
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isSemitransparent")).toEqual(true);
  // });
});
