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

import { RowContainer } from "./RowContainer";

const baseProps = {
  manualHeight: "500px",
};

describe("<RowContainer />", () => {
  it("renders without error", () => {
    render(
      <RowContainer
        {...baseProps}
        useReactWindow
        onScroll={() => {}}
        fetchMoreFiles={async () => {}}
        hasMoreFiles
        itemCount={2}
        filesLength={2}
        itemHeight={50}
      >
        <span>Demo</span>
        <span>Demo</span>
      </RowContainer>,
    );

    expect(screen.getByTestId("row-container")).toBeInTheDocument();
  });

  // it("stop event on context click", () => {
  //   const wrapper = shallow(
  //     <RowContainer>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   const event = { preventDefault: () => {} };

  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   jest.spyOn(event, "preventDefault");

  //   wrapper.simulate("contextmenu", event);

  //   expect(event.preventDefault).not.toBeCalled();
  // });

  // it("renders like list", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer useReactWindow={false}>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper).toExist();
  //   expect(wrapper.getDOMNode().style).toHaveProperty("height", "");
  // });

  // it("renders without manualHeight", () => {
  //   const wrapper = mount(
  //     <RowContainer>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper).toExist();
  // });

  // it("render with normal rows", () => {
  //   const wrapper = mount(
  //     <RowContainer {...baseProps}>
  //       // @ts-expect-error TS(2322): Type '{ children: string; contextOptions: { key: s... Remove this comment to see the full error message
  //       <div contextOptions={[{ key: "1", label: "test" }]}>test</div>
  //     </RowContainer>
  //   );

  //   expect(wrapper).toExist();
  // });

  // it("accepts id", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer {...baseProps} id="testId">
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer {...baseProps} className="test">
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2769): No overload matches this call.
  //     <RowContainer {...baseProps} style={{ color: "red" }}>
  //       <span>Demo</span>
  //     </RowContainer>
  //   );

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
