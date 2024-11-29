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
import { WhiteLabelLogoType } from "../enums";

import LoginPageSvgUrl from "PUBLIC_DIR/images/logo/loginpage.svg?url";
import DarkLoginPageSvgUrl from "PUBLIC_DIR/images/logo/dark_loginpage.svg?url";
import LeftMenuSvgUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";
import DocseditorSvgUrl from "PUBLIC_DIR/images/logo/docseditor.svg?url";
import LightSmallSvgUrl from "PUBLIC_DIR/images/logo/lightsmall.svg?url";
import DocsEditoRembedSvgUrl from "PUBLIC_DIR/images/logo/docseditorembed.svg?url";
import DarkLightSmallSvgUrl from "PUBLIC_DIR/images/logo/dark_lightsmall.svg?url";
import FaviconIco from "PUBLIC_DIR/images/logo/favicon.ico";

export const getLogoFromPath = (path: string) => {
  if (!path || path.indexOf("images/logo/") === -1) return path;

  const name = path.split("/").pop();

  switch (name) {
    case "aboutpage.svg":
    case "loginpage.svg":
      return LoginPageSvgUrl;
    case "dark_loginpage.svg":
      return DarkLoginPageSvgUrl;
    case "leftmenu.svg":
    case "dark_leftmenu.svg":
      return LeftMenuSvgUrl;
    case "dark_aboutpage.svg":
    case "dark_lightsmall.svg":
      return DarkLightSmallSvgUrl;
    case "docseditor.svg":
      return DocseditorSvgUrl;
    case "lightsmall.svg":
      return LightSmallSvgUrl;
    case "docseditorembed.svg":
      return DocsEditoRembedSvgUrl;
    case "favicon.ico":
      return FaviconIco;
    default:
      break;
  }

  return path;
};

export function getLogoUrl(
  logoType: WhiteLabelLogoType,
  dark: boolean = false,
  def: boolean = false,
  culture?: string,
) {
  return `/logo.ashx?logotype=${logoType}&dark=${dark}&default=${def}${culture ? `&culture=${culture}` : ""}`;
}
