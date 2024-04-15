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

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import { Button, ButtonSize } from "../button";
import { InputSize, InputType } from "../text-input";

import { InputBlock } from "./InputBlock";

describe("<InputBlock />", () => {
  it("renders without error", () => {
    const mask = [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/];
    render(
      <InputBlock
        mask={mask}
        value=""
        iconName={SearchReactSvgUrl}
        onIconClick={jest.fn}
        onChange={jest.fn}
        size={InputSize.base}
        type={InputType.text}
      >
        <Button
          size={ButtonSize.small}
          isDisabled={false}
          onClick={jest.fn}
          label="OK"
        />
      </InputBlock>,
    );

    expect(screen.getByTestId("input-block")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("test base size props", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
  //     <InputBlock iconName={SearchReactSvgUrl} size="base"></InputBlock>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toBe("base");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("test middle size props", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
  //     <InputBlock iconName={SearchReactSvgUrl} size="middle"></InputBlock>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toBe("middle");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("test big size props", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
  //     <InputBlock iconName={SearchReactSvgUrl} size="big"></InputBlock>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toBe("big");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("test huge size props", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ iconName: any; size: string; }' is not ass... Remove this comment to see the full error message
  //     <InputBlock iconName={SearchReactSvgUrl} size="huge"></InputBlock>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("size")).toBe("huge");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("test iconSize props", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ iconName: any; iconSize: number; }' is not... Remove this comment to see the full error message
  //     <InputBlock iconName={SearchReactSvgUrl} iconSize={18}></InputBlock>,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("iconSize")).toBe(18);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("test empty props", () => {
  //   const wrapper = mount(<InputBlock></InputBlock>);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper).toExist();
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; }' is not assignable to type '... Remove this comment to see the full error message
  //   const wrapper = mount(<InputBlock id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; }' is not assignable to... Remove this comment to see the full error message
  //   const wrapper = mount(<InputBlock className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   // @ts-expect-error TS(2322): Type '{ style: { color: string; }; }' is not assig... Remove this comment to see the full error message
  //   const wrapper = mount(<InputBlock style={{ color: "red" }} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
  // //TODO: Fix tests
  // /* it("call onChange", () => {
  //   const onChange = jest.fn();
  //   const wrapper = mount(
  //     <InputBlock
  //       iconName={SearchReactSvgUrl}
  //       size="huge"
  //       onChange={onChange}
  //     />
  //   );
  //   const input = wrapper.find("input");
  //   input.first().simulate("change", { target: { value: "test" } });
  //   expect(onChange).toHaveBeenCalled();
  // });
  // it("call onIconClick", () => {
  //   const onIconClick = jest.fn();
  //   const wrapper = mount(
  //     <InputBlock
  //       iconName={SearchReactSvgUrl}
  //       size="huge"
  //       isDisabled={false}
  //       onIconClick={onIconClick}
  //     />
  //   );
  //   const input = wrapper.find(".append div");
  //   input.first().simulate("click");
  //   expect(onIconClick).toHaveBeenCalled();
  // });
  // it("not call onChange", () => {
  //   const onChange = jest.fn();
  //   const wrapper = mount(
  //     <InputBlock iconName={SearchReactSvgUrl} size="huge" />
  //   );
  //   const input = wrapper.find("input");
  //   input.first().simulate("change", { target: { value: "test" } });
  //   expect(onChange).not.toHaveBeenCalled();
  // });
  // it("not call onIconClick", () => {
  //   const onIconClick = jest.fn();
  //   const wrapper = mount(
  //     <InputBlock
  //       iconName={SearchReactSvgUrl}
  //       size="huge"
  //       isDisabled={true}
  //       onIconClick={onIconClick}
  //     />
  //   );
  //   const input = wrapper.find(".append div");
  //   input.first().simulate("click");
  //   expect(onIconClick).not.toHaveBeenCalled();
  // });*/
});
