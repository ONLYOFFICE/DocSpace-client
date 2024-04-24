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

// import { EmailSettings } from "../../utils";
import { InputType } from "../text-input";
import { EmailInput } from "./EmailInput";

// const baseProps = {
//   id: "emailInputId",
//   name: "emailInputName",
//   value: "",
//   size: "base",
//   scale: false,
//   isDisabled: false,
//   isReadOnly: false,
//   maxLength: 255,
//   placeholder: "email",
//   onChange: jest.fn(),
//   onValidateInput: jest.fn(),
// };

describe("<EmailInput />", () => {
  it("Init invalid value test", () => {
    const email = "zzz";

    render(
      <EmailInput value={email} type={InputType.email} onChange={() => {}} />,
    );

    expect(screen.getByTestId("email-input")).toBeInTheDocument();
  });

  // it("Clean valid value test", () => {
  //   const email = "zzz";

  //   const wrapper = shallow(<EmailInput value={email} />).instance();

  //   let event = { target: { value: "simple@example.com" } };

  //   wrapper.onChange(event);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state.isValidEmail.isValid).toBe(true);

  //   event = { target: { value: "" } };

  //   wrapper.onChange(event);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state.isValidEmail.isValid).toBe(false);
  // });

  // it("Change value prop test", () => {
  //   const email = "zzz";

  //   const wrapper = mount(<EmailInput value={email} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().inputValue).toBe(email);

  //   wrapper.setProps({ value: "bar" });

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().isValidEmail.isValid).toBe(false);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().inputValue).toBe("bar");
  // });

  // it("Custom validation test", () => {
  //   const email = "zzz";

  //   const customValidate = (value: any) => {
  //     const isValid = !!(value && value.length > 0);
  //     return {
  //       isValid: isValid,
  //       errors: isValid ? [] : ["incorrect email"],
  //     };
  //   };

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ value: string; customValidate: (value: any... Remove this comment to see the full error message
  //     <EmailInput value={email} customValidate={customValidate} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().inputValue).toBe(email);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().isValidEmail.isValid).toBe(true);

  //   wrapper.setProps({ value: "bar" });

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().isValidEmail.isValid).toBe(true);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().inputValue).toBe("bar");

  //   wrapper.setProps({ value: "" });

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().isValidEmail.isValid).toBe(false);
  // });

  // it("renders without error", () => {
  //   const wrapper = mount(<EmailInput {...baseProps} />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper).toExist();
  // });

  // it('isValidEmail is "false" after deleting value', () => {
  //   const wrapper = mount(<EmailInput {...baseProps} />);

  //   const event = { target: { value: "test" } };

  //   wrapper.simulate("change", event);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().isValidEmail.isValid).toBe(false);

  //   const emptyValue = { target: { value: "" } };

  //   wrapper.simulate("change", emptyValue);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.state().isValidEmail.isValid).toBe(false);
  // });

  // it("passed valid email: simple@example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "simple@example.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email: disposable.style.email.with+symbol@example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = {
  //     target: { value: "disposable.style.email.with+symbol@example.com" },
  //   };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email: user.name+tag+sorting@example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "user.name+tag+sorting@example.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with one-letter local-part: x@example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "x@example.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email, local domain name with no TLD: admin@mailserver1", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "admin@mailserver1" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email, local domain name with no TLD: admin@mailserver1 (settings: allowLocalDomainName = true)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowLocalDomainName = true;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: "admin@mailserver1" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email (one-letter domain name): example@s.example", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "example@s.example" } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed valid email (space between the quotes): " "@example.org', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: '" "@example.org' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed valid email (space between the quotes): " "@example.org (settings: allowSpaces = true, allowStrictLocalPart = false)', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });
  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowSpaces = true;
  //   emailSettings.allowStrictLocalPart = false;

  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: '" "@example.org' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed valid email (quoted double dot): "john..doe"@example.org)', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: '"john..doe"@example.org' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed valid email (quoted double dot): "john..doe"@example.org (settings: allowSpaces = true, allowStrictLocalPart = false)', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });
  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowSpaces = true;
  //   emailSettings.allowStrictLocalPart = false;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: '"john..doe"@example.org' } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email (bangified host route used for uucp mailers): mailhost!username@example.org", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "mailhost!username@example.org" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email (bangified host route used for uucp mailers): mailhost!username@example.org (object settings: allowStrictLocalPart = false)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });
  //   const emailSettings = {
  //     allowStrictLocalPart: false,
  //   };
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={EmailSettings.parse(emailSettings)}
  //     />,
  //   );

  //   const event = { target: { value: "mailhost!username@example.org" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email (% escaped mail route to user@example.com via example.org): user%example.com@example.org)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });
  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowStrictLocalPart = false;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: "user%example.com@example.org" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with punycode symbols in domain: example@джpумлатест.bрфa", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "example@джpумлатест.bрфa" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with punycode symbols in local part: mañana@example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "mañana@example.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "mañana@mañana.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowDomainPunycode=true)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });
  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowDomainPunycode = true;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: "mañana@mañana.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowLocalPartPunycode=true)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });
  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowLocalPartPunycode = true;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: "mañana@mañana.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowDomainPunycode=true, allowLocalPartPunycode=true)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });
  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowLocalPartPunycode = true;
  //   emailSettings.allowDomainPunycode = true;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: "mañana@mañana.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowDomainPunycode=true, allowLocalPartPunycode=true, allowStrictLocalPart=false)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });
  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowLocalPartPunycode = true;
  //   emailSettings.allowDomainPunycode = true;
  //   emailSettings.allowStrictLocalPart = false;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: "mañana@mañana.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with IP address in domain: user@[127.0.0.1]", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "user@[127.0.0.1]" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with IP address in domain: user@[127.0.0.1] (settings: allowDomainIp = true)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const emailSettings = { allowDomainIp: true };
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={EmailSettings.parse(emailSettings)}
  //     />,
  //   );

  //   const event = { target: { value: "user@[127.0.0.1]" } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed valid email with Name (RFC 5322): "Jack Bowman" <jack@fogcreek.com>', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: '"Jack Bowman" <jack@fogcreek.com>' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed valid email with Name (RFC 5322): "Jack Bowman" <jack@fogcreek.com> (instance of EmailSettings: allowName = true)', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowName = true;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: '"Jack Bowman" <jack@fogcreek.com>' } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with Name (RFC 5322): Bob <bob@example.com>", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "Bob <bob@example.com>" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed valid email with Name (RFC 5322): Bob <bob@example.com> (instance of EmailSettings: allowName = true)", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(true);
  //   });

  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowName = true;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: "Bob <bob@example.com>" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed invalid email (no @ character): Abc.example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "Abc.example.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed invalid email (only one @ is allowed outside quotation marks): A@b@c@example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: "A@b@c@example.com" } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed invalid email (none of the special characters in this local-part are allowed outside quotation marks): a"b(c)d,e:f;g<h>i[jk]l@example.com', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: 'a"b(c)d,e:f;g<h>i[jk]l@example.com' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed invalid email (none of the special characters in this local-part are allowed outside quotation marks): a"b(c)d,e:f;g<h>i[jk]l@example.com', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = { target: { value: 'a"b(c)d,e:f;g<h>i[jk]l@example.com' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed invalid email (quoted strings must be dot separated or the only element making up the local-part): just"not"right@example.com', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowSpaces = true;
  //   emailSettings.allowStrictLocalPart = false;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: 'just"not"right@example.com' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed invalid email  (spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash): this is"notallowed@example.com', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowSpaces = true;
  //   emailSettings.allowStrictLocalPart = false;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: 'this is"notallowed@example.com' } };

  //   wrapper.simulate("change", event);
  // });

  // it('passed invalid email (even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes): this still"not\\allowed@example.com', () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const emailSettings = new EmailSettings();
  //   emailSettings.allowSpaces = true;
  //   emailSettings.allowStrictLocalPart = false;
  //   const wrapper = mount(
  //     <EmailInput
  //       {...baseProps}
  //       // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
  //       onValidateInput={onValidateInput}
  //       emailSettings={emailSettings}
  //     />,
  //   );

  //   const event = { target: { value: 'this still"not\\allowed@example.com' } };

  //   wrapper.simulate("change", event);
  // });

  // it("passed invalid email (local part is longer than 64 characters): 1234567890123456789012345678901234567890123456789012345678901234+x@example.com", () => {
  //   const onValidateInput = jest.fn((isValidEmail: any) => {
  //     // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //     expect(isValidEmail.isValid).toEqual(false);
  //   });

  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} onValidateInput={onValidateInput} />,
  //   );

  //   const event = {
  //     target: {
  //       value:
  //         "1234567890123456789012345678901234567890123456789012345678901234+x@example.com",
  //     },
  //   };

  //   wrapper.simulate("change", event);
  // });

  // it("accepts id", () => {
  //   // @ts-expect-error TS(2322): Type '{ id: string; name: string; value: string; s... Remove this comment to see the full error message
  //   const wrapper = mount(<EmailInput {...baseProps} id="testId" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("id")).toEqual("testId");
  // });

  // it("accepts className", () => {
  //   // @ts-expect-error TS(2322): Type '{ className: string; id: string; name: strin... Remove this comment to see the full error message
  //   const wrapper = mount(<EmailInput {...baseProps} className="test" />);

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.prop("className")).toEqual("test");
  // });

  // it("accepts style", () => {
  //   const wrapper = mount(
  //     // @ts-expect-error TS(2322): Type '{ style: { color: string; }; id: string; nam... Remove this comment to see the full error message
  //     <EmailInput {...baseProps} style={{ color: "red" }} />,
  //   );

  //   // @ts-expect-error TS(2304): Cannot find name 'expect'.
  //   expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  // });
});
