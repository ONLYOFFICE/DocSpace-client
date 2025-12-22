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

import { BASE_URL, API_PREFIX } from "../../utils";

const MANAGEMENT_BASE_PATH = "/management";

const getManagementLogoPath = (fileName: string) =>
  `${MANAGEMENT_BASE_PATH}/images/logo/${fileName}`;

export const PATH_WHITELABEL_LOGOS =
  "/settings/whitelabel/logos?isDefault=true";

export const PATH_WHITELABEL_LOGOTEXT =
  "/settings/whitelabel/logotext?isDefault=true";

export const PATH_WHITELABEL_LOGOS_IS_DEFAULT =
  "/settings/whitelabel/logos/isdefault?isDefault=true";

const whiteLabelLogos = {
  response: [
    {
      type: 1,
      name: "LightSmall",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 48,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 422,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("lightsmall.svg"),
        dark: getManagementLogoPath("dark_lightsmall.svg"),
      },
    },
    {
      type: 2,
      name: "LoginPage",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 88,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 772,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("loginpage.svg"),
        dark: getManagementLogoPath("dark_loginpage.svg"),
      },
    },
    {
      type: 3,
      name: "Favicon",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 32,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 32,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("leftmenu.svg"),
      },
    },
    {
      type: 4,
      name: "DocsEditor",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("docseditor.svg"),
      },
    },
    {
      type: 5,
      name: "DocsEditorEmbed",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("docseditorembed.svg"),
      },
    },
    {
      type: 6,
      name: "LeftMenu",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 56,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 56,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("leftmenu.svg"),
        dark: getManagementLogoPath("dark_leftmenu.svg"),
      },
    },
    {
      type: 7,
      name: "AboutPage",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 48,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 442,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("aboutpage.svg"),
        dark: getManagementLogoPath("dark_aboutpage.svg"),
      },
    },
    {
      type: 9,
      name: "SpreadsheetEditor",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("spreadsheeteditor.svg"),
      },
    },
    {
      type: 10,
      name: "SpreadsheetEditorEmbed",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("spreadsheeteditorembed.svg"),
      },
    },
    {
      type: 11,
      name: "PresentationEditor",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("presentationeditor.svg"),
      },
    },
    {
      type: 12,
      name: "PresentationEditorEmbed",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("presentationeditorembed.svg"),
      },
    },
    {
      type: 13,
      name: "PdfEditor",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("pdfeditor.svg"),
      },
    },
    {
      type: 14,
      name: "PdfEditorEmbed",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("pdfeditorembed.svg"),
      },
    },
    {
      type: 15,
      name: "DiagramEditor",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("diagrameditor.svg"),
      },
    },
    {
      type: 16,
      name: "DiagramEditorEmbed",
      size: {
        aspectRatio: false,
        fillArea: false,
        greater: false,
        height: 40,
        ignoreAspectRatio: false,
        isPercentage: false,
        less: false,
        limitPixels: false,
        width: 172,
        x: 0,
        y: 0,
      },
      path: {
        light: getManagementLogoPath("diagrameditorembed.svg"),
      },
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/settings/whitelabel/logos?isDefault=true`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const whiteLabelLogosIsDefault = {
  response: [
    {
      name: "LightSmall",
      default: true,
    },
    {
      name: "LoginPage",
      default: true,
    },
    {
      name: "Favicon",
      default: true,
    },
    {
      name: "DocsEditor",
      default: true,
    },
    {
      name: "DocsEditorEmbed",
      default: true,
    },
    {
      name: "LeftMenu",
      default: true,
    },
    {
      name: "AboutPage",
      default: true,
    },
    {
      name: "Notification",
      default: true,
    },
    {
      name: "SpreadsheetEditor",
      default: true,
    },
    {
      name: "SpreadsheetEditorEmbed",
      default: true,
    },
    {
      name: "PresentationEditor",
      default: true,
    },
    {
      name: "PresentationEditorEmbed",
      default: true,
    },
    {
      name: "PdfEditor",
      default: true,
    },
    {
      name: "PdfEditorEmbed",
      default: true,
    },
    {
      name: "DiagramEditor",
      default: true,
    },
    {
      name: "DiagramEditorEmbed",
      default: true,
    },
  ],
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/settings/whitelabel/logos/isdefault?isDefault=true`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

const whiteLabelLogoText = {
  response: "ONLYOFFICE",
  count: 1,
  links: [
    {
      href: `${BASE_URL}/${API_PREFIX}/settings/whitelabel/logotext?isDefault=true`,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

export const whiteLabelLogosHandler = () => {
  return new Response(JSON.stringify(whiteLabelLogos));
};

export const whiteLabelLogoTextHandler = () => {
  return new Response(JSON.stringify(whiteLabelLogoText));
};

export const whiteLabelLogosIsDefaultHandler = () => {
  return new Response(JSON.stringify(whiteLabelLogosIsDefault));
};
