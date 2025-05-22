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

import { ILogo } from "./WhiteLabel.types";

export const mockLogos: ILogo[] = [
  {
    name: "LightSmall",
    size: {
      width: 422,
      height: 48,
      isEmpty: false,
    },
    path: {
      light: "lightsmall.svg",
      dark: "dark_lightsmall.svg",
    },
  },
  {
    name: "LoginPage",
    size: {
      width: 772,
      height: 88,
      isEmpty: false,
    },
    path: {
      light: "loginpage.svg",
      dark: "dark_loginpage.svg",
    },
  },
  {
    name: "Favicon",
    size: {
      width: 32,
      height: 32,
      isEmpty: false,
    },
    path: {
      light: "favicon.ico",
      dark: "",
    },
  },
  {
    name: "DocsEditor",
    size: {
      width: 172,
      height: 40,
      isEmpty: false,
    },
    path: {
      light: "docseditor.svg",
      dark: "",
    },
  },
  {
    name: "DocsEditorEmbed",
    size: {
      width: 172,
      height: 40,
      isEmpty: false,
    },
    path: {
      light: "docseditorembed.svg",
      dark: "",
    },
  },
  {
    name: "LeftMenu",
    size: {
      width: 56,
      height: 56,
      isEmpty: false,
    },
    path: {
      light: "leftmenu.svg",
      dark: "dark_leftmenu.svg",
    },
  },
  {
    name: "AboutPage",
    size: {
      width: 442,
      height: 48,
      isEmpty: false,
    },
    path: {
      light: "aboutpage.svg",
      dark: "dark_aboutpage.svg",
    },
  },
];
