/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import LightSmallSvgUrl from "PUBLIC_DIR/images/logo/lightsmall.svg?url";
import DarkLightSmallSvgUrl from "PUBLIC_DIR/images/logo/dark_lightsmall.svg?url";
import LoginPageSvgUrl from "PUBLIC_DIR/images/logo/loginpage.svg?url";
import DarkLoginPageSvgUrl from "PUBLIC_DIR/images/logo/dark_loginpage.svg?url";
import FaviconUrl from "PUBLIC_DIR/images/logo/favicon.ico";
import DocsEditorSvgUrl from "PUBLIC_DIR/images/logo/docseditor.svg?url";
import DocsEditorEmbedSvgUrl from "PUBLIC_DIR/images/logo/docseditorembed.svg?url";
import LeftMenuSvgUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import DarkLeftMenuSvgUrl from "PUBLIC_DIR/images/logo/dark_leftmenu.svg?url";
import AboutPageSvgUrl from "PUBLIC_DIR/images/logo/aboutpage.svg?url";
import DarkAboutPageSvgUrl from "PUBLIC_DIR/images/logo/dark_aboutpage.svg?url";

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
      light: LightSmallSvgUrl,
      dark: DarkLightSmallSvgUrl,
    },
    type: 0, // Assuming type 0 is for light logos
  },
  {
    name: "LoginPage",
    size: {
      width: 772,
      height: 88,
      isEmpty: false,
    },
    path: {
      light: LoginPageSvgUrl,
      dark: DarkLoginPageSvgUrl,
    },
    type: 1, // Assuming type 1 is for dark logos
  },
  {
    name: "Favicon",
    size: {
      width: 32,
      height: 32,
      isEmpty: false,
    },
    path: {
      light: FaviconUrl,
      dark: "",
    },
    type: 2, // Assuming type 2 is for favicon
  },
  {
    name: "DocsEditor",
    size: {
      width: 172,
      height: 40,
      isEmpty: false,
    },
    path: {
      light: DocsEditorSvgUrl,
      dark: "",
    },
    type: 3, // Assuming type 3 is for DocsEditor logos
  },
  {
    name: "DocsEditorEmbed",
    size: {
      width: 172,
      height: 40,
      isEmpty: false,
    },
    path: {
      light: DocsEditorEmbedSvgUrl,
      dark: "",
    },
    type: 4, // Assuming type 4 is for DocsEditorEmbed logos
  },
  {
    name: "LeftMenu",
    size: {
      width: 56,
      height: 56,
      isEmpty: false,
    },
    path: {
      light: LeftMenuSvgUrl,
      dark: DarkLeftMenuSvgUrl,
    },
    type: 5, // Assuming type 5 is for left menu logos
  },
  {
    name: "AboutPage",
    size: {
      width: 442,
      height: 48,
      isEmpty: false,
    },
    path: {
      light: AboutPageSvgUrl,
      dark: DarkAboutPageSvgUrl,
    },
    type: 6, // Assuming type 6 is for About page logos
  },
];
