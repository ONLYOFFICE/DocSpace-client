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
import ShareAppleReactSvg from "PUBLIC_DIR/images/share.apple.react.svg";
import ShareGoogleReactSvg from "PUBLIC_DIR/images/share.google.react.svg";
import ShareFacebookReactSvg from "PUBLIC_DIR/images/share.facebook.react.svg";
import ShareTwitterReactSvg from "PUBLIC_DIR/images/thirdparties/twitter.svg";
import ShareLinkedinReactSvg from "PUBLIC_DIR/images/share.linkedin.react.svg";
import ShareMicrosoftReactSvg from "PUBLIC_DIR/images/share.microsoft.react.svg";
import ShareZoomReactSvg from "PUBLIC_DIR/images/share.zoom.react.svg";
import { globalColors } from "../themes/globalColors";

export const PROVIDERS_DATA = Object.freeze({
  appleid: {
    label: "apple",
    icon: ShareAppleReactSvg,
    iconOptions: undefined,
  },
  google: {
    label: "google",
    icon: ShareGoogleReactSvg,
    iconOptions: undefined,
  },
  facebook: {
    label: "facebook",
    icon: ShareFacebookReactSvg,
    iconOptions: undefined,
  },
  twitter: {
    label: "twitter",
    icon: ShareTwitterReactSvg,
    iconOptions: { color: globalColors.darkBlack },
  },
  linkedin: {
    label: "linkedin",
    icon: ShareLinkedinReactSvg,
    iconOptions: undefined,
  },
  microsoft: {
    label: "microsoft",
    icon: ShareMicrosoftReactSvg,
    iconOptions: undefined,
  },
  zoom: {
    label: "zoom",
    icon: ShareZoomReactSvg,
    iconOptions: undefined,
  },
});
