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

import { InputSize } from "../text-input";

import { SearchInput } from "./SearchInput";

const baseProps = {
  value: "",
  size: InputSize.base,
  // getFilterData: () => [
  //   {
  //     key: "filter-example",
  //     group: "filter-example",
  //     label: "example group",
  //     isHeader: true,
  //   },
  //   { key: "filter-example-test", group: "filter-example", label: "Test" },
  // ],
};

describe("<SearchInput />", () => {
  it("renders without error", () => {
    render(<SearchInput {...baseProps} />);

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("middle size prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ size: string; isNeedFilter: boolean; value... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} size="middle" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("middle");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("big size prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ size: string; isNeedFilter: boolean; value... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} size="big" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("big");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("huge size prop", () => {
  //   // @ts-expect-error TS(2322): Type '{ size: string; isNeedFilter: boolean; value... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} size="huge" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toEqual("huge");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; isNeedFilter: boolean; value: ... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; isNeedFilter: boolean; ... Remove this comment to see the full error message
  //   const wrapper = mount(<SearchInput {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; isNeedFilter: b... Remove this comment to see the full error message
  //     <SearchInput {...baseProps} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
  // // TODO: Fix icons tests
  // /*it("call onClearSearch", () => {
  //   const onClearSearch = jest.fn();
  //   const onChange = jest.fn();
  //   const wrapper = mount(
  //     <SearchInput
  //       {...baseProps}
  //       onClearSearch={onClearSearch}
  //       onChange={onChange}
  //     />
  //   );

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const icon = wrapper.find(".append div");
  //   icon.first().simulate("click");
  //   expect(onClearSearch).toHaveBeenCalled();
  // });
  // it("not call onClearSearch", () => {
  //   const onClearSearch = jest.fn();
  //   const onChange = jest.fn();
  //   const wrapper = mount(<SearchInput {...baseProps} onChange={onChange} />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const icon = wrapper.find(".append div");
  //   icon.first().simulate("click");
  //   expect(onClearSearch).not.toHaveBeenCalled();
  // });
  // it("componentDidUpdate() props lifecycle test", () => {
  //   const wrapper = shallow(<SearchInput {...baseProps} />);
  //   const instance = wrapper.instance();

  //   instance.componentDidUpdate(
  //     {
  //       opened: true,
  //       selectedOption: {
  //         value: "test",
  //       },
  //     },
  //     wrapper.state()
  //   );

  //   expect(wrapper.props()).toBe(wrapper.props());
  // });
  // it("not call setSearchTimer", (done) => {
  //   const onChange = jest.fn();
  //   const wrapper = mount(
  //     <SearchInput {...baseProps} autoRefresh={false} onChange={onChange} />
  //   );

  //   const input = wrapper.find("input");
  //   input.first().simulate("change", { target: { value: "test" } });

  //   setTimeout(() => {
  //     expect(onChange).not.toHaveBeenCalled();
  //     done();
  //   }, 1000);
  // });
  // it("call setSearchTimer", (done) => {
  //   const onChange = jest.fn();
  //   const wrapper = mount(<SearchInput {...baseProps} onChange={onChange} />);

  //   const instance = wrapper.instance();
  //   instance.setSearchTimer("test");

  //   setTimeout(() => {
  //     expect(onChange).toHaveBeenCalled();
  //     done();
  //   }, 1000);
  // });
  // it("test icon button size. base size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="base" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(12);
  // });
  // it("test icon button size. middle size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="middle" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(16);
  // });
  // it("test icon button size. big size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="big" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(19);
  // });
  // it("test icon button size. huge size prop", () => {
  //   const wrapper = mount(<SearchInput {...baseProps} size="huge" />);

  //   wrapper
  //     .find("input")
  //     .first()
  //     .simulate("change", { target: { value: "test" } });

  //   const inputBlock = wrapper.find(InputBlock);
  //   expect(inputBlock.prop("iconSize")).toEqual(22);
  // });*/
});
