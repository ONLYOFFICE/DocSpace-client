// (c) Copyright Ascensio System SIA 2009-2025
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

import { describe, it, expect } from "vitest";
import {
  parseAddress,
  EmailSettings,
  Email,
  isEqualEmail,
  isValidDomainName,
  parseAddresses,
} from "./index";

const emailSettingsObj: { [key: string]: boolean } = {
  allowDomainPunycode: true,
  allowLocalPartPunycode: true,
  allowDomainIp: true,
  allowStrictLocalPart: false,
  allowSpaces: true,
  allowName: true,
  allowLocalDomainName: true,
};

const emailSettingsInstance = EmailSettings.parse(emailSettingsObj);

describe("email", () => {
  // testing equals method

  it("emails are equal, both - instances of Email class with name", () => {
    const email = new Email("John Doe", "john@doe.com");

    const email2 = new Email("John Doe", "john@doe.com");
    const isEmailEqual = email.equals(email2);

    expect(isEmailEqual).toBe(true);
  });

  it("emails is not equal, both - instances of Email class with name", () => {
    const email = new Email("John Doe", "john@doe.com");

    const email2 = new Email("John Doe2", "john@doe.com");
    const isEmailEqual = email.equals(email2);

    expect(isEmailEqual).toBe(false);
  });

  it("emails are equal, 1st: instance of Email class, 2nd: string according to RFC 5322, both emails with name", () => {
    const email = new Email("Bob Example", "bob@example.com");
    const email2 = '"Bob Example" <bob@example.com>';
    const isEmailEqual = email.equals(email2);

    expect(isEmailEqual).toBe(true);
  });

  it("emails is not equal, 1st: instance of Email class, 2nd: string according to RFC 5322, both emails with name", () => {
    const email = new Email("Bob1 Example", "bob@example.com");
    const email2 = '"Bob Example" <bob@example.com>';
    const isEmailEqual = email.equals(email2);

    expect(isEmailEqual).toBe(false);
  });

  it("emails is not equal, both - instances of Email class, 1st email without name", () => {
    const email = new Email(undefined, "john@doe.com");

    const email2 = new Email("John Doe", "john@doe.com");
    const isEmailEqual = email.equals(email2);

    expect(isEmailEqual).toBe(false);
  });

  it("emails is not equal, 1st: instance of Email class with name, 2nd: string according to RFC 5321 (without name)", () => {
    const email = new Email("Bob Example", "bob@example.com");
    const email2 = "bob@example.com";
    const isEmailEqual = email.equals(email2);

    expect(isEmailEqual).toBe(false);
  });

  it("emails is not equal, 1st: instance of Email class, 2nd: object with same parameters", () => {
    const email = new Email("Bob Example", "bob@example.com");
    const email2 = {
      name: "Bob Example",
      email: "bob@example.com",
    };
    const isEmailEqual = email.equals(email2);

    expect(isEmailEqual).toBe(false);
  });

  // testing isEqualEmail function

  it("emails RFC 5322 are equal", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = '"Bob Example" <bob@example.com>';
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(true);
  });

  it("emails RFC 5322 are equal, 2nd email`s name without quotes", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = "Bob Example <bob@example.com>";
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(true);
  });

  it("emails are equal", () => {
    const email = "bob@example.com";
    const email2 = "bob@example.com";
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(true);
  });

  it("emails RFC 5322 are equal with different names", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = '"Bob Example1" <bob@example.com>';
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(true);
  });

  it("emails RFC 5322 are equal with different names, 2nd email`s name without quotes", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = "Bob Example1 <bob@example.com>";
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(true);
  });

  it("emails is not equal", () => {
    const email = "bob@example.com";
    const email2 = "bob@example1.com";
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(false);
  });

  it("emails RFC 5322 is not equal with same names and different addresses", () => {
    const email = '"Bob Example" <bob@example.com>';
    const email2 = '"Bob Example" <bob1@example.com>';
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(false);
  });

  it("passed invalid emails", () => {
    const email = "test@test.com, test2@test.com";
    const email2 = "test@example.";
    const isEmailEqual = isEqualEmail(email, email2);

    expect(isEmailEqual).toBe(false);
  });

  // testing isValidDomainName function

  it("validate domain name", () => {
    const domain = "test.ru";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(true);
  });

  it("validate domain name with spaces", () => {
    const domain = " test.ru";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(false);
  });

  it("validate domain name with punycode symbols", () => {
    const domain = "mañana.com";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(true);
  });

  it("validate domain name with IP address with brackets", () => {
    const domain = "[127.0.0.1]";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(true);
  });

  it("validate domain name with IP address without brackets", () => {
    const domain = "127.0.0.1";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(true);
  });

  it('validate domain name only with digits in TLD: "test.00"', () => {
    const domain = "test.00";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(true);
  });

  it('validate domain name with digits in TLD: "test.com1"', () => {
    const domain = "test.com1";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(true);
  });

  it("validate local domain", () => {
    const domain = "local";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(false);
  });

  it('validate invalid domain name "test."', () => {
    const domain = "test.";
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(false);
  });

  it("validate invalid domain name with spaces", () => {
    const domain = 'tes"  "t.com';
    const isDomainValid = isValidDomainName(domain);

    expect(isDomainValid).toBe(false);
  });

  // testing parseAddress function

  it("parsing one address", () => {
    const emailAddress = "test@test.com";
    const parsed = parseAddress(emailAddress);

    expect(parsed.isValid()).toBe(true);

    expect(parsed.email).toBe(emailAddress);
  });

  it("parsing two addresses through function for parsing single email", () => {
    const emailAddress = "test@test.com, test2@test.com";
    const parsed = parseAddress(emailAddress);

    expect(parsed.isValid()).toBe(false);

    expect(parsed.parseErrors?.[0].message).toBe("Too many email parsed");
  });

  it("parsing two addresses (2nd is invalid) through function for parsing single email", () => {
    const emailAddress = "test@test.com, test";
    const parsed = parseAddress(emailAddress);

    expect(parsed.isValid()).toBe(false);

    expect(parsed.parseErrors?.[0].message).toBe("Too many email parsed");
  });

  it("parsing one address, passed emailSettings as Object", () => {
    const emailAddress = "test@test.com";

    try {
      parseAddress(emailAddress, emailSettingsObj);
    } catch (err: unknown) {
      const knownError = err as { name: string };

      expect(knownError.name).toBe("TypeError");
    }
  });

  it("parsing one address, passed emailSettings as instance of EmailSettings class", () => {
    const emailAddress = "test@test.com";
    const parsed = parseAddress(emailAddress, emailSettingsInstance);

    expect(parsed.isValid()).toBe(true);

    expect(parsed.email).toBe(emailAddress);
  });

  // test parseAddresses function

  it("parsing two addresses through function for parsing emails", () => {
    const emailAddress = "test@test.com, test2@test2.com";
    const parsed = parseAddresses(emailAddress);

    expect(parsed.length).toBe(2);

    expect(parsed[0].email).toBe("test@test.com");

    expect(parsed[1].email).toBe("test2@test2.com");
  });

  it("parsing wrong email with comma in local part", () => {
    const emailAddress = 'te"st@test.com';
    const parsed = parseAddress(emailAddress);

    expect(parsed.isValid()).toBe(false);

    expect(parsed.parseErrors?.[0].message).toBe("Incorrect email");

    expect(parsed.email).toBe(emailAddress);

    expect(parsed.name).toBe("");
  });

  it("parsing empty string", () => {
    const emailAddress = "";
    const parsed = parseAddress(emailAddress);

    expect(parsed.isValid()).toBe(false);

    expect(parsed.parseErrors?.[0].message).toBe("No one email parsed");

    expect(parsed.email).toBe(emailAddress);

    expect(parsed.name).toBe("");
  });
});
