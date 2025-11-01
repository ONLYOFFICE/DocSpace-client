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

import { css } from "styled-components";

export enum IconSizeType {
  extraSmall = "extraSmall",
  small = "small",
  medium = "medium",
  big = "big",
  scale = "scale",
}

const enum IconSizes {
  extraSmall = 8,
  small = 12,
  medium = 16,
  big = 24,
  scale = "scale",
}

const getSizeStyle = (size?: IconSizeType | number) => {
  switch (size) {
    case "scale":
      return `
          &:not(:root) {
            width: 100%;
            height: 100%;
          }
        `;
    case IconSizeType.extraSmall:
      return `
          
      width: ${IconSizes.extraSmall}px;
      
      min-width: ${IconSizes.extraSmall}px;
      
      height: ${IconSizes.extraSmall}px;
      
      min-height: ${IconSizes.extraSmall}px;
    `;
    case IconSizeType.small:
      return `
          
      width: ${IconSizes.small}px;
      
      min-width: ${IconSizes.small}px;
      
      height: ${IconSizes.small}px;
      
      min-height: ${IconSizes.small}px;
    `;
    case IconSizeType.medium:
      return `
          
      width: ${IconSizes.medium}px;
      
      min-width: ${IconSizes.medium}px;
      
      height: ${IconSizes.medium}px;
      
      min-height: ${IconSizes.medium}px;
    `;
    case IconSizeType.big:
      return `
          width: ${IconSizes.big}px;
          min-width: ${IconSizes.big}px;
          height: ${IconSizes.big}px;
          min-height: ${IconSizes.big}px;
        `;
    default:
      return `
        width: ${size}px;
        min-width: ${size}px;
        height: ${size}px;
        min-height: ${size}px;
      `;
  }
};

const commonIconsStyles = css<{ size?: IconSizeType | number }>`
  overflow: hidden;
  vertical-align: middle;
  ${(props) => getSizeStyle(props.size)};
`;

export const isIconSizeType = (size: unknown): size is IconSizeType => {
  return (
    typeof size === "string" &&
    Object.values(IconSizeType).includes(size as IconSizeType)
  );
};

export default commonIconsStyles;
