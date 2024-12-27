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

import { Row } from "./Row";

const baseProps = {
  checked: false,
  element: <span>1</span>,
  contextOptions: [{ key: "1", label: "test" }],
  children: <span>Some text</span>,
};

describe("<Row />", () => {
  it("renders without error", () => {
    render(
      <Row {...baseProps} isIndexEditingMode={false} onRowClick={() => {}} />,
    );

    expect(screen.getByTestId("row")).toBeInTheDocument();
  });

  // it("call changeCheckbox(e)", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onSelect = jest.fn();
  //   const wrapper = shallow(
  //     <Row
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onChange: any; onSelect: any; data: { test... Remove this comment to see the full error message
  //       onChange={onSelect}
  //       onSelect={onSelect}
  //       data={{ test: "test" }}
  //     />,
  //   );

  //   wrapper.simulate("change", { target: { checked: true } });

  //   expect(onSelect).toHaveBeenCalled();
  // });

  // it("renders with children", () => {
  //   const wrapper = mount(<Row {...baseProps} />);

  //   expect(wrapper).toHaveProp("children", baseProps.children);
  // });

  // it("renders with contentElement and sectionWidth", () => {
  //   const element = <div>content</div>;
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ contentElement: Element; sectionWidth: num... Remove this comment to see the full error message
  //     <Row {...baseProps} contentElement={element} sectionWidth={600} />,
  //   );

  //   expect(wrapper).toHaveProp("contentElement", element);
  // });

  // it("can apply contextButtonSpacerWidth", () => {
  //   const test = "10px";
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ contextButtonSpacerWidth: string; checked:... Remove this comment to see the full error message
  //     <Row {...baseProps} contextButtonSpacerWidth={test} />,
  //   );

  //   expect(wrapper).toHaveProp("contextButtonSpacerWidth", test);
  // });

  // it("can apply data property", () => {
  //   const test = { test: "test" };
  //   // @ts-expect-error TS(2322): Type '{ data: { test: string; }; checked: boolean;... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} data={test} />);

  //   expect(wrapper).toHaveProp("data", test);
  // });

  // it("can apply indeterminate", () => {
  //   const test = true;
  //   // @ts-expect-error TS(2322): Type '{ indeterminate: boolean; checked: boolean; ... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} indeterminate={test} />);

  //   expect(wrapper).toHaveProp("indeterminate", test);
  // });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; checked: boolean; element: Ele... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} id="testId" />);

  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; checked: boolean; eleme... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} className="test" />);

  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; checked: boolea... Remove this comment to see the full error message
  //   const wrapper = mount(<Row {...baseProps} style={{ color: "red" }} />);

  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
