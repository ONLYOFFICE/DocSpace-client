import {
  parseAddress,
  EmailSettings,
  Email,
  isEqualEmail,
  isValidDomainName,
  parseAddresses,
} from "./index";

const emailSettingsObj = {
  allowDomainPunycode: true,
  allowLocalPartPunycode: true,
  allowDomainIp: true,
  allowStrictLocalPart: false,
  allowSpaces: true,
  allowName: true,
  allowLocalDomainName: true,
};

const emailSettingsInstance = EmailSettings.parse(emailSettingsObj);

// @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("email", () => {
  // testing equals method

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails are equal, both - instances of Email class with name", () => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email = new Email("John Doe", "john@doe.com");
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email2 = new Email("John Doe", "john@doe.com");
    const isEmailEqual = email.equals(email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails is not equal, both - instances of Email class with name", () => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email = new Email("John Doe", "john@doe.com");
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email2 = new Email("John Doe2", "john@doe.com");
    const isEmailEqual = email.equals(email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails are equal, 1st: instance of Email class, 2nd: string according to RFC 5322, both emails with name", () => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email = new Email("Bob Example", "bob@example.com");
    const email2 = '"Bob Example" <bob@example.com>';
    const isEmailEqual = email.equals(email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails is not equal, 1st: instance of Email class, 2nd: string according to RFC 5322, both emails with name", () => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email = new Email("Bob1 Example", "bob@example.com");
    const email2 = '"Bob Example" <bob@example.com>';
    const isEmailEqual = email.equals(email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails is not equal, both - instances of Email class, 1st email without name", () => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email = new Email(undefined, "john@doe.com");
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email2 = new Email("John Doe", "john@doe.com");
    const isEmailEqual = email.equals(email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails is not equal, 1st: instance of Email class with name, 2nd: string according to RFC 5321 (without name)", () => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email = new Email("Bob Example", "bob@example.com");
    const email2 = "bob@example.com";
    const isEmailEqual = email.equals(email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails is not equal, 1st: instance of Email class, 2nd: object with same parameters", () => {
    // @ts-expect-error TS(2554): Expected 3 arguments, but got 2.
    const email = new Email("Bob Example", "bob@example.com");
    const email2 = {
      name: "Bob Example",
      email: "bob@example.com",
    };
    const isEmailEqual = email.equals(email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // testing isEqualEmail function

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails RFC 5322 are equal", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = '"Bob Example" <bob@example.com>';
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails RFC 5322 are equal, 2nd email`s name without quotes", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = "Bob Example <bob@example.com>";
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails are equal", () => {
    const email = "bob@example.com";
    const email2 = "bob@example.com";
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails RFC 5322 are equal with different names", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = '"Bob Example1" <bob@example.com>';
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails RFC 5322 are equal with different names, 2nd email`s name without quotes", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = "Bob Example1 <bob@example.com>";
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails is not equal", () => {
    const email = "bob@example.com";
    const email2 = "bob@example1.com";
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("emails RFC 5322 is not equal with same names and different addresses", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = '"Bob Example" <bob1@example.com>';
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("passed invalid emails", () => {
    const email = "test@test.com, test2@test.com";
    const email2 = "test@example.";
    const isEmailEqual = isEqualEmail(email, email2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isEmailEqual).toBe(false);
  });

  // testing isValidDomainName function

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("validate domain name", () => {
    const domain = "test.ru";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("validate domain name with spaces", () => {
    const domain = " test.ru";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("validate domain name with punycode symbols", () => {
    const domain = "mañana.com";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("validate domain name with IP address with brackets", () => {
    const domain = "[127.0.0.1]";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("validate domain name with IP address without brackets", () => {
    const domain = "127.0.0.1";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validate domain name only with digits in TLD: "test.00"', () => {
    const domain = "test.00";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validate domain name with digits in TLD: "test.com1"', () => {
    const domain = "test.com1";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(true);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("validate local domain", () => {
    const domain = "local";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validate invalid domain name "test."', () => {
    const domain = "test.";
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(false);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("validate invalid domain name with spaces", () => {
    const domain = 'tes"  "t.com';
    const isDomainValid = isValidDomainName(domain);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(isDomainValid).toBe(false);
  });

  // testing parseAddress function

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing one address", () => {
    const emailAddress = "test@test.com";
    const parsed = parseAddress(emailAddress);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.isValid()).toBe(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.email).toBe(emailAddress);
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing two addresses through function for parsing single email", () => {
    const emailAddress = "test@test.com, test2@test.com";
    const parsed = parseAddress(emailAddress);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.isValid()).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.parseErrors[0].message).toBe("Too many email parsed");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing two addresses (2nd is invalid) through function for parsing single email", () => {
    const emailAddress = "test@test.com, test";
    const parsed = parseAddress(emailAddress);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.isValid()).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.parseErrors[0].message).toBe("Too many email parsed");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing one address, passed emailSettings as Object", () => {
    const emailAddress = "test@test.com";

    try {
      // @ts-expect-error TS(2345): Argument of type '{ allowDomainPunycode: boolean; ... Remove this comment to see the full error message
      parseAddress(emailAddress, emailSettingsObj);
    } catch (err) {
      // @ts-expect-error TS(2304): Cannot find name 'expect'.
      expect(err.name).toBe("TypeError");
    }
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing one address, passed emailSettings as instance of EmailSettings class", () => {
    const emailAddress = "test@test.com";
    const parsed = parseAddress(emailAddress, emailSettingsInstance);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.isValid()).toBe(true);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.email).toBe(emailAddress);
  });

  // test parseAddresses function

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing two addresses through function for parsing emails", () => {
    const emailAddress = "test@test.com, test2@test2.com";
    const parsed = parseAddresses(emailAddress);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.length).toBe(2);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed[0].email).toBe("test@test.com");
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed[1].email).toBe("test2@test2.com");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing wrong email with comma in local part", () => {
    const emailAddress = 'te"st@test.com';
    const parsed = parseAddress(emailAddress);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.isValid()).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.parseErrors[0].message).toBe("Incorrect email");
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.email).toBe(emailAddress);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.name).toBe("");
  });

  // @ts-expect-error TS(2582): Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("parsing empty string", () => {
    const emailAddress = "";
    const parsed = parseAddress(emailAddress);

    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.isValid()).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.parseErrors[0].message).toBe("No one email parsed");
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.email).toBe(emailAddress);
    // @ts-expect-error TS(2304): Cannot find name 'expect'.
    expect(parsed.name).toBe("");
  });
});
