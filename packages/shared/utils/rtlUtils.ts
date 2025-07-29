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

import { TInterfaceDirection } from "../themes";
import { DEFAULT_FONT_FAMILY, SYSTEM_FONT_FAMILY } from "../constants";

/* Returns correct text-align value depending on interface direction (ltr/rtl) */
export const getCorrectTextAlign = (
  currentTextAlign: string,
  interfaceDirection: TInterfaceDirection | string,
) => {
  if (!currentTextAlign) return interfaceDirection === "rtl" ? "right" : "left";

  if (interfaceDirection === "ltr") return currentTextAlign;

  switch (currentTextAlign) {
    case "left":
      return "right";
    case "right":
      return "left";
    default:
      return currentTextAlign;
  }
};

/* Returns correct four values style (margin/padding etc) depending on interface direction (ltr/rtl)
 * Not suitable for border-radius! */
export const getCorrectFourValuesStyle = (
  styleStr: string,
  interfaceDirection: TInterfaceDirection | string,
) => {
  if (interfaceDirection === "ltr") return styleStr;

  const styleArr = styleStr.split(" ");
  if (styleArr.length !== 4) return styleStr;

  const styleRightValue = styleArr[1];
  const styleLeftValue = styleArr[3];

  styleArr[1] = styleLeftValue;
  styleArr[3] = styleRightValue;

  return styleArr.join(" ");
};

/* Returns correct border-radius value depending on interface direction (ltr/rtl) */
export const getCorrectBorderRadius = (
  borderRadiusStr: string,
  interfaceDirection: TInterfaceDirection | string,
) => {
  if (interfaceDirection === "ltr") return borderRadiusStr;

  const borderRadiusArr = borderRadiusStr.split(" ");

  switch (borderRadiusArr.length) {
    // [10px] => "10px"
    case 1: {
      return borderRadiusStr;
    }
    // [10px 20px] => [20px 10px]
    case 2: {
      borderRadiusArr.splice(0, 0, borderRadiusArr.splice(1, 1)[0]);
      break;
    }
    // [10px 20px 30px] => [20px 10px 20px 30px]
    case 3: {
      borderRadiusArr.splice(0, 0, borderRadiusArr[1]);
      break;
    }
    // [10px 20px 30px 40px] => [20px 10px 40px 30px]
    case 4: {
      borderRadiusArr.splice(0, 0, borderRadiusArr.splice(1, 1)[0]);
      borderRadiusArr.splice(2, 0, borderRadiusArr.splice(3, 1)[0]);
      break;
    }
    default:
  }

  return borderRadiusArr.join(" ");
};

/* Returns system font family for arabic lang */
export const getFontFamilyDependingOnLanguage = (lng: string) => {
  const arabicLocale = "ar-SA";
  const shouldUseSystemFont = lng?.toLowerCase() === arabicLocale.toLowerCase();

  return shouldUseSystemFont ? SYSTEM_FONT_FAMILY : DEFAULT_FONT_FAMILY;
};
