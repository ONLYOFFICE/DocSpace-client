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

import { ToggleButton } from "./ToggleButton";

describe("<ToggleButton />", () => {
  test("renders without error", () => {
    render(<ToggleButton isChecked={false} onChange={() => {}} label="Text" />);

    expect(screen.getByTestId("toggle-button")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("Toggle button componentDidUpdate() test", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ isChecked: boolean; onChange: () => any; }... Remove this comment to see the full error message
  //     <ToggleButton isChecked={false} onChange={() => jest.fn()} />
  //   ).instance();
  //   wrapper.componentDidUpdate(wrapper.props);

  //   const wrapper2 = mount(
  //     // @ts-expect-error TS(2322): Type '{ isChecked: boolean; onChange: () => any; }... Remove this comment to see the full error message
  //     <ToggleButton isChecked={true} onChange={() => jest.fn()} />
  //   ).instance();
  //   wrapper2.componentDidUpdate(wrapper2.props);

  //   const wrapper3 = shallow(
  //     // @ts-expect-error TS(2322): Type '{ isChecked: boolean; onChange: () => any; }... Remove this comment to see the full error message
  //     <ToggleButton isChecked={false} onChange={() => jest.fn()} />
  //   );
  //   wrapper3.setState({ isOpen: true });
  //   wrapper3.instance().componentDidUpdate(wrapper3.props());

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props).toBe(wrapper.props);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state.checked).toBe(wrapper.props.isChecked);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper2.props).toBe(wrapper2.props);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper2.state.checked).toBe(wrapper2.props.isChecked);
  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper3.state()).toBe(wrapper3.state());
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   const wrapper = mount(
  //     <ToggleButton
  //       // @ts-expect-error TS(2322): Type '{ label: string; onChange: () => any; isChec... Remove this comment to see the full error message
  //       label="text"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={() => jest.fn()}
  //       isChecked={false}
  //       id="testId"
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   const wrapper = mount(
  //     <ToggleButton
  //       // @ts-expect-error TS(2322): Type '{ label: string; onChange: () => any; isChec... Remove this comment to see the full error message
  //       label="text"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={() => jest.fn()}
  //       isChecked={false}
  //       className="test"
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     <ToggleButton
  //       // @ts-expect-error TS(2322): Type '{ label: string; onChange: () => any; isChec... Remove this comment to see the full error message
  //       label="text"
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange={() => jest.fn()}
  //       isChecked={false}
  //       style={{ color: "red" }}
  //     />
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
