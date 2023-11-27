/* eslint-disable no-useless-escape */
import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'enzy... Remove this comment to see the full error message
import { mount, shallow } from "enzyme";
import EmailInput from ".";
import { EmailSettings } from "../utils/email/";

const baseProps = {
  id: "emailInputId",
  name: "emailInputName",
  value: "",
  size: "base",
  scale: false,
  isDisabled: false,
  isReadOnly: false,
  maxLength: 255,
  placeholder: "email",
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onChange: () => jest.fn(),
  // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
  onValidateInput: () => jest.fn(),
};

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("<EmailInput />", () => {
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Init invalid value test", () => {
    const email = "zzz";
    // @ts-expect-error TS(2322): Type '{ value: string; }' is not assignable to typ... Remove this comment to see the full error message
    const wrapper = shallow(<EmailInput value={email} />).instance();

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state.isValidEmail.isValid).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Clean valid value test", () => {
    const email = "zzz";

    // @ts-expect-error TS(2322): Type '{ value: string; }' is not assignable to typ... Remove this comment to see the full error message
    const wrapper = shallow(<EmailInput value={email} />).instance();

    let event = { target: { value: "simple@example.com" } };

    wrapper.onChange(event);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state.isValidEmail.isValid).toBe(true);

    event = { target: { value: "" } };

    wrapper.onChange(event);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state.isValidEmail.isValid).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Change value prop test", () => {
    const email = "zzz";

    // @ts-expect-error TS(2322): Type '{ value: string; }' is not assignable to typ... Remove this comment to see the full error message
    const wrapper = mount(<EmailInput value={email} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().inputValue).toBe(email);

    wrapper.setProps({ value: "bar" });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().isValidEmail.isValid).toBe(false);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().inputValue).toBe("bar");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("Custom validation test", () => {
    const email = "zzz";

    const customValidate = (value: any) => {
      const isValid = !!(value && value.length > 0);
      return {
        isValid: isValid,
        errors: isValid ? [] : ["incorrect email"],
      };
    };

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ value: string; customValidate: (value: any... Remove this comment to see the full error message
      <EmailInput value={email} customValidate={customValidate} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().inputValue).toBe(email);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().isValidEmail.isValid).toBe(true);

    wrapper.setProps({ value: "bar" });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().isValidEmail.isValid).toBe(true);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().inputValue).toBe("bar");

    wrapper.setProps({ value: "" });

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().isValidEmail.isValid).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("renders without error", () => {
    const wrapper = mount(<EmailInput {...baseProps} />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper).toExist();
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('isValidEmail is "false" after deleting value', () => {
    const wrapper = mount(<EmailInput {...baseProps} />);

    const event = { target: { value: "test" } };

    wrapper.simulate("change", event);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().isValidEmail.isValid).toBe(false);

    const emptyValue = { target: { value: "" } };

    wrapper.simulate("change", emptyValue);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.state().isValidEmail.isValid).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email: simple@example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "simple@example.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email: disposable.style.email.with+symbol@example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = {
      target: { value: "disposable.style.email.with+symbol@example.com" },
    };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email: user.name+tag+sorting@example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "user.name+tag+sorting@example.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with one-letter local-part: x@example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "x@example.com" } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email, local domain name with no TLD: admin@mailserver1", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "admin@mailserver1" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email, local domain name with no TLD: admin@mailserver1 (settings: allowLocalDomainName = true)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const emailSettings = new EmailSettings();
    emailSettings.allowLocalDomainName = true;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: "admin@mailserver1" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email (one-letter domain name): example@s.example", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "example@s.example" } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed valid email (space between the quotes): " "@example.org', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: '" "@example.org' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed valid email (space between the quotes): " "@example.org (settings: allowSpaces = true, allowStrictLocalPart = false)', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });
    const emailSettings = new EmailSettings();
    emailSettings.allowSpaces = true;
    emailSettings.allowStrictLocalPart = false;

    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: '" "@example.org' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed valid email (quoted double dot): "john..doe"@example.org)', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: '"john..doe"@example.org' } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed valid email (quoted double dot): "john..doe"@example.org (settings: allowSpaces = true, allowStrictLocalPart = false)', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });
    const emailSettings = new EmailSettings();
    emailSettings.allowSpaces = true;
    emailSettings.allowStrictLocalPart = false;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: '"john..doe"@example.org' } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email (bangified host route used for uucp mailers): mailhost!username@example.org", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "mailhost!username@example.org" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email (bangified host route used for uucp mailers): mailhost!username@example.org (object settings: allowStrictLocalPart = false)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });
    const emailSettings = {
      allowStrictLocalPart: false,
    };
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={EmailSettings.parse(emailSettings)}
      />
    );

    const event = { target: { value: "mailhost!username@example.org" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email (% escaped mail route to user@example.com via example.org): user%example.com@example.org)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });
    const emailSettings = new EmailSettings();
    emailSettings.allowStrictLocalPart = false;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: "user%example.com@example.org" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with punycode symbols in domain: example@джpумлатест.bрфa", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "example@джpумлатест.bрфa" } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with punycode symbols in local part: mañana@example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "mañana@example.com" } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "mañana@mañana.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowDomainPunycode=true)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });
    const emailSettings = new EmailSettings();
    emailSettings.allowDomainPunycode = true;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: "mañana@mañana.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowLocalPartPunycode=true)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });
    const emailSettings = new EmailSettings();
    emailSettings.allowLocalPartPunycode = true;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: "mañana@mañana.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowDomainPunycode=true, allowLocalPartPunycode=true)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });
    const emailSettings = new EmailSettings();
    emailSettings.allowLocalPartPunycode = true;
    emailSettings.allowDomainPunycode = true;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: "mañana@mañana.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with punycode symbols in local part and domain: mañana@mañana.com (settings: allowDomainPunycode=true, allowLocalPartPunycode=true, allowStrictLocalPart=false)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });
    const emailSettings = new EmailSettings();
    emailSettings.allowLocalPartPunycode = true;
    emailSettings.allowDomainPunycode = true;
    emailSettings.allowStrictLocalPart = false;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: "mañana@mañana.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with IP address in domain: user@[127.0.0.1]", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "user@[127.0.0.1]" } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with IP address in domain: user@[127.0.0.1] (settings: allowDomainIp = true)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const emailSettings = { allowDomainIp: true };
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={EmailSettings.parse(emailSettings)}
      />
    );

    const event = { target: { value: "user@[127.0.0.1]" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed valid email with Name (RFC 5322): "Jack Bowman" <jack@fogcreek.com>', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: '"Jack Bowman" <jack@fogcreek.com>' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed valid email with Name (RFC 5322): "Jack Bowman" <jack@fogcreek.com> (instance of EmailSettings: allowName = true)', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const emailSettings = new EmailSettings();
    emailSettings.allowName = true;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: '"Jack Bowman" <jack@fogcreek.com>' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with Name (RFC 5322): Bob <bob@example.com>", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "Bob <bob@example.com>" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed valid email with Name (RFC 5322): Bob <bob@example.com> (instance of EmailSettings: allowName = true)", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(true);
    });

    const emailSettings = new EmailSettings();
    emailSettings.allowName = true;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: "Bob <bob@example.com>" } };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed invalid email (no @ character): Abc.example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "Abc.example.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed invalid email (only one @ is allowed outside quotation marks): A@b@c@example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: "A@b@c@example.com" } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed invalid email (none of the special characters in this local-part are allowed outside quotation marks): a"b(c)d,e:f;g<h>i[jk]l@example.com', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: 'a"b(c)d,e:f;g<h>i[jk]l@example.com' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed invalid email (none of the special characters in this local-part are allowed outside quotation marks): a"b(c)d,e:f;g<h>i[jk]l@example.com', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = { target: { value: 'a"b(c)d,e:f;g<h>i[jk]l@example.com' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed invalid email (quoted strings must be dot separated or the only element making up the local-part): just"not"right@example.com', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const emailSettings = new EmailSettings();
    emailSettings.allowSpaces = true;
    emailSettings.allowStrictLocalPart = false;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: 'just"not"right@example.com' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed invalid email  (spaces, quotes, and backslashes may only exist when within quoted strings and preceded by a backslash): this is"notallowed@example.com', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const emailSettings = new EmailSettings();
    emailSettings.allowSpaces = true;
    emailSettings.allowStrictLocalPart = false;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: 'this is"notallowed@example.com' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passed invalid email (even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes): this still"not\\allowed@example.com', () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const emailSettings = new EmailSettings();
    emailSettings.allowSpaces = true;
    emailSettings.allowStrictLocalPart = false;
    const wrapper = mount(
      <EmailInput
        {...baseProps}
        // @ts-expect-error TS(2322): Type '{ onValidateInput: any; emailSettings: Email... Remove this comment to see the full error message
        onValidateInput={onValidateInput}
        emailSettings={emailSettings}
      />
    );

    const event = { target: { value: 'this still"not\\allowed@example.com' } };

    wrapper.simulate("change", event);
  });
  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed invalid email (local part is longer than 64 characters): 1234567890123456789012345678901234567890123456789012345678901234+x@example.com", () => {
    // @ts-expect-error TS(2708): Cannot use namespace 'jest' as a value.
    const onValidateInput = jest.fn((isValidEmail: any) => {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(isValidEmail.isValid).toEqual(false);
    });

    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ onValidateInput: any; id: string; name: st... Remove this comment to see the full error message
      <EmailInput {...baseProps} onValidateInput={onValidateInput} />
    );

    const event = {
      target: {
        value:
          "1234567890123456789012345678901234567890123456789012345678901234+x@example.com",
      },
    };

    wrapper.simulate("change", event);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts id", () => {
    // @ts-expect-error TS(2322): Type '{ id: string; name: string; value: string; s... Remove this comment to see the full error message
    const wrapper = mount(<EmailInput {...baseProps} id="testId" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("id")).toEqual("testId");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts className", () => {
    // @ts-expect-error TS(2322): Type '{ className: string; id: string; name: strin... Remove this comment to see the full error message
    const wrapper = mount(<EmailInput {...baseProps} className="test" />);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.prop("className")).toEqual("test");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("accepts style", () => {
    const wrapper = mount(
      // @ts-expect-error TS(2322): Type '{ style: { color: string; }; id: string; nam... Remove this comment to see the full error message
      <EmailInput {...baseProps} style={{ color: "red" }} />
    );

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(wrapper.getDOMNode().style).toHaveProperty("color", "red");
  });
});
