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

import { InputSize, InputType } from "../text-input";
import { PasswordInput } from "./PasswordInput";

// const basePasswordSettings = {
//   minLength: 6,
//   upperCase: false,
//   digits: false,
//   specSymbols: false,
// };

// const baseProps = {
//   inputName: "demoPasswordInput",
//   emailInputName: "demoEmailInput",
//   inputValue: "",
//   tooltipPasswordTitle: "Password must contain:",
//   tooltipPasswordLength: "from 6 to 30 characters",
//   tooltipPasswordDigits: "digits",
//   tooltipPasswordCapital: "capital letters",
//   tooltipPasswordSpecial: "special characters (!@#$%^&*)",
//   generatorSpecial: "!@#$%^&*",
//   passwordSettings: basePasswordSettings,
//   isDisabled: false,
//   placeholder: "password",

//   onChange: jest.fn(),

//   onValidateInput: jest.fn(),
// };

describe("<PasswordInput />", () => {
  it("renders without error", () => {
    render(
      <PasswordInput inputType={InputType.password} size={InputSize.base} />,
    );

    expect(screen.getByTestId("password-input")).toBeInTheDocument();
  });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("render password input", () => {
  //   const wrapper = mount(<PasswordInput {...baseProps} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.find("input").prop("type")).toEqual("password");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("have an HTML name", () => {
  //   const wrapper = mount(<PasswordInput {...baseProps} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.find("input").prop("name")).toEqual("demoPasswordInput");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("forward passed value", () => {
  //   // @ts-expect-error TS(2322): Type '{ inputValue: string; inputName: string; ema... Remove this comment to see the full error message
  //   const wrapper = mount(<PasswordInput {...baseProps} inputValue="demo" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.props().inputValue).toEqual("demo");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("call onChange when changing value", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onChange = jest.fn((event: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(event.target.id).toEqual("demoPasswordInput");
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(event.target.name).toEqual("demoPasswordInput");
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(event.target.value).toEqual("demo");
  //   });

  //   const wrapper = mount(
  //     <PasswordInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ id: string; name: string; onChange: any; i... Remove this comment to see the full error message
  //       id="demoPasswordInput"
  //       name="demoPasswordInput"
  //       onChange={onChange}
  //     />,
  //   );

  //   const event = { target: { value: "demo" } };

  //   wrapper.simulate("change", event);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("call onFocus when input is focused", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onFocus = jest.fn((event: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(event.target.id).toEqual("demoPasswordInput");
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(event.target.name).toEqual("demoPasswordInput");
  //   });

  //   const wrapper = mount(
  //     <PasswordInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ id: string; name: string; onFocus: any; in... Remove this comment to see the full error message
  //       id="demoPasswordInput"
  //       name="demoPasswordInput"
  //       onFocus={onFocus}
  //     />,
  //   );

  //   wrapper.simulate("focus");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("call onBlur when input loses focus", () => {
  //   // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //   const onBlur = jest.fn((event: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(event.target.id).toEqual("demoPasswordInput");
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(event.target.name).toEqual("demoPasswordInput");
  //   });

  //   const wrapper = mount(
  //     <PasswordInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ id: string; name: string; onBlur: any; inp... Remove this comment to see the full error message
  //       id="demoPasswordInput"
  //       name="demoPasswordInput"
  //       onBlur={onBlur}
  //     />,
  //   );

  //   wrapper.simulate("blur");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("disabled when isDisabled is passed", () => {
  //   // @ts-expect-error TS(2322): Type '{ isDisabled: boolean; inputName: string; em... Remove this comment to see the full error message
  //   const wrapper = mount(<PasswordInput {...baseProps} isDisabled={true} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isDisabled")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("not re-render test", () => {
  //   const wrapper = shallow(<PasswordInput {...baseProps} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     wrapper.props,
  //     wrapper.state,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(false);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("re-render test", () => {
  //   const wrapper = shallow(<PasswordInput {...baseProps} />).instance();

  //   const shouldUpdate = wrapper.shouldComponentUpdate(
  //     {
  //       inputName: "demoPasswordInput",
  //       emailInputName: "demoEmailInput",
  //       inputValue: "",
  //       tooltipPasswordTitle: "Password must contain:",
  //       tooltipPasswordLength: "from 6 to 30 characters",
  //       tooltipPasswordDigits: "digits",
  //       tooltipPasswordCapital: "capital letters",
  //       tooltipPasswordSpecial: "special characters (!@#$%^&*)",
  //       generatorSpecial: "!@#$%^&*",
  //       passwordSettings: {
  //         minLength: 8,
  //         upperCase: false,
  //         digits: false,
  //         specSymbols: false,
  //       },
  //       isDisabled: false,
  //       placeholder: "password",
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onChange: () => jest.fn(),
  //       // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  //       onValidateInput: () => jest.fn(),
  //     },
  //     wrapper.state,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(shouldUpdate).toBe(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("generate password with props: 10 , false , false , false", () => {
  //   const newPasswordSettings = {
  //     minLength: 10,
  //     upperCase: false,
  //     digits: false,
  //     specSymbols: false,
  //   };

  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ passwordSettings: { minLength: number; upp... Remove this comment to see the full error message
  //     <PasswordInput {...baseProps} passwordSettings={newPasswordSettings} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.onGeneratePassword();

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state("type")).toBe("text");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("generate password with props: 10 , true , false , false", () => {
  //   const newPasswordSettings = {
  //     minLength: 10,
  //     upperCase: true,
  //     digits: false,
  //     specSymbols: false,
  //   };

  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ passwordSettings: { minLength: number; upp... Remove this comment to see the full error message
  //     <PasswordInput {...baseProps} passwordSettings={newPasswordSettings} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.onGeneratePassword();

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state("type")).toBe("text");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("generate password with props: 10 , true , true , false", () => {
  //   const newPasswordSettings = {
  //     minLength: 10,
  //     upperCase: true,
  //     digits: true,
  //     specSymbols: false,
  //   };

  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ passwordSettings: { minLength: number; upp... Remove this comment to see the full error message
  //     <PasswordInput {...baseProps} passwordSettings={newPasswordSettings} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.onGeneratePassword();

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state("type")).toBe("text");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("generate password with props: 10 , true , true , true", () => {
  //   const newPasswordSettings = {
  //     minLength: 10,
  //     upperCase: true,
  //     digits: true,
  //     specSymbols: true,
  //   };

  //   const wrapper = shallow(
  //     // @ts-expect-error TS(2322): Type '{ passwordSettings: { minLength: number; upp... Remove this comment to see the full error message
  //     <PasswordInput {...baseProps} passwordSettings={newPasswordSettings} />,
  //   );
  //   const instance = wrapper.instance();

  //   instance.onGeneratePassword();

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state("type")).toBe("text");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; inputName: stri... Remove this comment to see the full error message
  //     <PasswordInput {...baseProps} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; inputName: string; emai... Remove this comment to see the full error message
  //   const wrapper = mount(<PasswordInput {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("Tooltip disabled when isDisableTooltip is true", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ isDisableTooltip: boolean; inputName: stri... Remove this comment to see the full error message
  //     <PasswordInput {...baseProps} isDisableTooltip={true} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isDisableTooltip")).toEqual(true);
  // });

  // // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  // it("TextTooltip shown when isTextTooltipVisible is true", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ isTextTooltipVisible: boolean; inputName: ... Remove this comment to see the full error message
  //     <PasswordInput {...baseProps} isTextTooltipVisible={true} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("isTextTooltipVisible")).toEqual(true);
  // });
});
