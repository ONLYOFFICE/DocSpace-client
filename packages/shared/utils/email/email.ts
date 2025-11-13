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

import emailAddresses, { ParsedGroup, ParsedMailbox } from "email-addresses";

import { ErrorKeys, ParseErrorTypes } from "../../enums";

import { EmailSettings } from "./emailSettings";

/**
 * Parse address from string
 * @param {String} str
 * @return {Email} result
 */
export const parseAddress = (
  str: string,
  options: EmailSettings | { [key: string]: boolean } = new EmailSettings(),
) => {
  const parsedEmails = parseAddresses(str, options);

  if (!parsedEmails.length) {
    return new Email("", str, [
      {
        message: "No one email parsed",
        type: ParseErrorTypes.EmptyRecipients,
        errorKey: ErrorKeys.EmptyEmail,
      },
    ]);
  }

  if (parsedEmails.length > 1) {
    return new Email("", str, [
      {
        message: "Too many email parsed",
        type: ParseErrorTypes.IncorrectEmail,
        errorKey: ErrorKeys.ManyEmails,
      },
    ]);
  }

  const resultEmail = parsedEmails[0];

  return resultEmail;
};

export class Email {
  email?: string;

  name?: string;

  parseErrors?: {
    message: string | null;
    type: ParseErrorTypes;
    errorKey: ErrorKeys;
  }[];

  constructor(
    name?: string | null,
    email?: string,
    parseErrors?: {
      message: string;
      type: ParseErrorTypes;
      errorKey: ErrorKeys;
    }[],
  ) {
    this.name = name || "";
    this.email = email;
    this.parseErrors = parseErrors;
  }

  isValid = () => {
    return this.parseErrors?.length === 0;
  };
  // biome-ignore lint/suspicious/noExplicitAny: TODO fix
  equals(this: any, addr: { [key: string]: string } | string | Email) {
    if (typeof addr === "object" && addr instanceof Email) {
      return (
        "email" in this && this?.email === addr.email && this.name === addr.name
      );
    }

    if (typeof addr === "string") {
      const parsed = parseAddress(addr);
      return this.email === parsed.email && this.name === parsed.name;
    }

    return false;
  }
}

export const getParts = (str: string) => {
  const parts = [];
  const newStr = str.replace(/[\s,;]*$/, ",");
  const n = newStr.length;
  let flag = false;
  let boundaryIndex = 0;
  let index;
  for (index = 0; index < n; index += 1) {
    switch (newStr.charAt(index)) {
      case ",":
      case ";":
        if (!flag) {
          let part = newStr.substring(boundaryIndex, index);
          part = part.trim();
          if (part) {
            parts.push(part);
          }
          boundaryIndex = index + 1;
        }
        break;
      case '"':
        if (
          newStr.charAt(index - 1) !== "\\" &&
          newStr.charAt(index + 1) !== '"'
        ) {
          flag = !flag;
        }
        break;
      default:
    }
  }

  if (!parts.length) {
    parts.push(str.replace(/,\s*$/, ""));
  }

  return parts;
};

const normalizeString = (str: string) => {
  const r1 = /^"(.*)"\s*<([^>]+)>$/;
  const r2 = /^(.*)<([^>]+)>$/;
  const match = str.match(r1) || str.match(r2);

  let name;
  let email;

  if (match) {
    name = match[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
    email = match[2].trim();
  } else {
    email = str;
  }

  const result = name
    ? `"${name.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}" <${email}>`
    : email;

  return result;
};

const checkErrors = (
  parsedAddress: ParsedGroup | ParsedMailbox,
  options: EmailSettings,
) => {
  const errors = [];

  if (
    !options?.allowLocalDomainName &&
    "domain" in parsedAddress &&
    parsedAddress.domain.indexOf(".") === -1
  ) {
    errors.push({
      message: "Local domains are not supported",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.LocalDomain,
    });
  }

  if (
    !(
      options.allowDomainIp ||
      options.allowDomainPunycode ||
      options.allowLocalDomainName
    ) &&
    "domain" in parsedAddress &&
    !/(^((?!-)[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}\.?$)/.test(
      parsedAddress.domain,
    )
  ) {
    errors.push({
      message: "Incorrect domain",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.IncorrectDomain,
    });
  }

  if (
    !options.allowDomainIp &&
    "domain" in parsedAddress &&
    parsedAddress.domain.indexOf("[") === 0 &&
    parsedAddress.domain.indexOf("]") === parsedAddress.domain.length - 1
  ) {
    errors.push({
      message: "Domains as ip address are not supported",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.DomainIpAddress,
    });
  }

  if (
    !options.allowDomainPunycode &&
    "domain" in parsedAddress &&
    /^xn--/.test(parsedAddress.domain)
  ) {
    errors.push({
      message: "Punycode domains are not supported",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.PunycodeDomain,
    });
  }

  if (
    !options.allowLocalPartPunycode &&
    "local" in parsedAddress &&
    parsedAddress.local.length > 0 &&
    /^xn--/.test(parsedAddress.local)
  ) {
    errors.push({
      message: "Punycode local part are not supported",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.PunycodeLocalPart,
    });
  }

  // biome-ignore-start lint/suspicious/noControlCharactersInRegex: TODO fix
  if (
    options.allowStrictLocalPart &&
    "local" in parsedAddress &&
    (!/^[\x00-\x7F]+$/.test(parsedAddress.local) ||
      !/^[_]?([a-zA-Z0-9]+)([_\-\.\+][a-zA-Z0-9]+)*[_]?$/.test(
        parsedAddress.local,
      ))
  ) {
    errors.push({
      message: "Incorrect localpart",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.IncorrectLocalPart,
    });
  }
  // biome-ignore-end lint/suspicious/noControlCharactersInRegex: TODO fix

  if (
    !options.allowSpaces &&
    "local" in parsedAddress &&
    (/\s+/.test(parsedAddress.local) ||
      parsedAddress.local !== parsedAddress.parts.local.tokens)
  ) {
    errors.push({
      message: "Incorrect, localpart contains spaces",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.SpacesInLocalPart,
    });
  }

  if ("local" in parsedAddress && parsedAddress.local.length > 64) {
    errors.push({
      message:
        "The maximum total length of a user name or other local-part is 64 characters. See RFC2821",
      type: ParseErrorTypes.IncorrectEmail,
      errorItem: parsedAddress,
      errorKey: ErrorKeys.MaxLengthExceeded,
    });
  }

  return errors;
};

const parseOneAddress = (str: string, options: EmailSettings) => {
  const normalizedStr = normalizeString(str);
  const parsedAddress = emailAddresses.parseOneAddress(normalizedStr);

  const errors = [];

  if (!parsedAddress || (parsedAddress.name && !options.allowName)) {
    errors.push({
      message: "Incorrect email",
      type: ParseErrorTypes.IncorrectEmail,
      errorKey: ErrorKeys.IncorrectEmail,
    });
  } else {
    const checkOptionErrors = checkErrors(parsedAddress, options);
    if (checkOptionErrors.length) errors.push(...checkOptionErrors);
  }

  return parsedAddress && "name" in parsedAddress && "address" in parsedAddress
    ? new Email(parsedAddress.name, parsedAddress.address, errors)
    : new Email(null, str, errors);
};

/**
 * Parse addresses from string
 * @param {String} str
 * @return {Array} result with array of Email objects
 */
export const parseAddresses = (
  str: string,
  options: EmailSettings | { [key: string]: boolean } = new EmailSettings(),
) => {
  if (!(options instanceof EmailSettings))
    throw new TypeError("Invalid options");

  const resultEmails: Email[] = [];

  if (!str || !str.trim()) {
    return resultEmails;
  }

  const parts = getParts(str);

  let i;
  const n = parts.length;

  for (i = 0; i < n; i += 1) {
    resultEmails.push(parseOneAddress(parts[i], options));
  }

  return resultEmails;
};

/**
 * Check domain validity
 * @param {String} domain
 * @return {Bool} result
 */
export const isValidDomainName = (domain: string) => {
  const parsed = emailAddresses.parseOneAddress(`test@${domain}`);
  if (!parsed) return false;

  return (
    parsed &&
    "domain" in parsed &&
    parsed.domain === domain &&
    domain.indexOf(".") !== -1
  );
};

/**
 * Compare emails
 * @param {String}/{Object} email1
 * @param {String}/{Object} email2
 * @return {Bool} result
 */
export const isEqualEmail = (email1: string, email2: string) => {
  const emailSettings = new EmailSettings();
  emailSettings.disableAllSettings();

  const parsed1 = parseAddress(email1, emailSettings);
  const parsed2 = parseAddress(email2, emailSettings);

  if (!parsed1.isValid() || !parsed2.isValid()) {
    return false;
  }

  return parsed1.email === parsed2.email;
};
