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

export const verifyAlgorithms = {
  "rsa-sha1": "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
  "rsa-sha256": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
  "rsa-sha512": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha512",
};

export const decryptAlgorithms = {
  "aes128-cbc": "http://www.w3.org/2001/04/xmlenc#aes128-cbc",
  "aes256-cbc": "http://www.w3.org/2001/04/xmlenc#aes256-cbc",
  "tripledes-cbc": "http://www.w3.org/2001/04/xmlenc#tripledes-cbc",
};

export const verifyAlgorithmsOptions = Object.keys(verifyAlgorithms).map(
  (key) => ({
    key: verifyAlgorithms[key],
    label: key,
  }),
);

export const decryptAlgorithmsOptions = Object.keys(decryptAlgorithms).map(
  (key) => ({
    key: decryptAlgorithms[key],
    label: key,
  }),
);

export const nameIdFormats = {
  "unspecified_1.1": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified",
  emailAddress: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  entity: "urn:oasis:names:tc:SAML:2.0:nameid-format:entity",
  transient: "urn:oasis:names:tc:SAML:2.0:nameid-format:transient",
  persistent: "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
  encrypted: "urn:oasis:names:tc:SAML:2.0:nameid-format:encrypted",
  "unspecified_2.0": "urn:oasis:names:tc:SAML:2.0:nameid-format:unspecified",
  X509SubjectName: "urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName",
  WindowsDomainQualifiedName:
    "urn:oasis:names:tc:SAML:1.1:nameid-format:WindowsDomainQualifiedName",
  kerberos: "urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos",
};

export const nameIdOptions = Object.keys(nameIdFormats).map((key) => ({
  key: nameIdFormats[key],
  label: nameIdFormats[key],
  dataTestId: `${key}_option`,
}));

export const ssoBindingOptions = [
  {
    id: "sso-post",
    value: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
    label: "POST",
    disabled: false,
    dataTestId: "sso_post_option",
  },
  {
    id: "sso-redirect",
    value: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
    label: "Redirect",
    disabled: false,
    dataTestId: "sso_redirect_option",
  },
];

export const sloBindingOptions = [
  {
    id: "slo-post",
    value: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",
    label: "POST",
    disabled: false,
    dataTestId: "slo_post_option",
  },
  {
    id: "slo-redirect",
    value: "urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect",
    label: "Redirect",
    disabled: false,
    dataTestId: "slo_redirect_option",
  },
];
