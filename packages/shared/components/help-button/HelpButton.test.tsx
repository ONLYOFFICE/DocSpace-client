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

import { HelpButton } from "./HelpButton";

const tooltipContent = "You tooltip content";
describe("<HelpButton />", () => {
  it("HelpButton renders without error", () => {
    render(<HelpButton tooltipContent={tooltipContent} />);
    expect(screen.getByTestId("help-button")).toBeInTheDocument();
  });

  // it("HelpButton componentWillUnmount  test", () => {
  //   const wrapper = mount(<HelpButton tooltipContent={tooltipContent} />);
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const componentWillUnmount = jest.spyOn(
  //     wrapper.instance(),
  //     "componentWillUnmount",
  //   );
  //   wrapper.unmount();
  //   expect(componentWillUnmount).toHaveBeenCalled();
  // });

  // it("HelpButton test afterHide function", () => {
  //   const wrapper = shallow(
  //     <HelpButton tooltipContent={tooltipContent} />,
  //   ).instance();
  //   wrapper.afterHide();
  //   expect(wrapper.state.hideTooltip).toEqual(false);

  //   wrapper.setState({ hideTooltip: false });
  //   wrapper.afterHide();
  //   expect(wrapper.state.hideTooltip).toEqual(false);
  // });

  // it("accepts id", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ tooltipContent: string; id: string; }' is ... Remove this comment to see the full error message
  //     <HelpButton tooltipContent={tooltipContent} id="testId" />,
  //   );

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ tooltipContent: string; className: string;... Remove this comment to see the full error message
  //     <HelpButton tooltipContent={tooltipContent} className="test" />,
  //   );

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ tooltipContent: string; style: { color: st... Remove this comment to see the full error message
  //     <HelpButton tooltipContent={tooltipContent} style={{ color: "red" }} />,
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
