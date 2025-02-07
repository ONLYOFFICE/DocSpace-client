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

import { TTranslation } from "@docspace/shared/types";
import { FormFillingTipsState } from "../../../enums";
import { isTablet } from "../../../utils";
import { GuidancePosition, GuidanceElementType } from "./Guid.types";

const DEFAULT_POSITION = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
} as const;

interface ViewDimensions {
  width: number;
  height: number;
  top: number;
}

const getViewTypeBasedDimensions = (
  rect: DOMRect,
  viewAs: string,
  offset: GuidancePosition["offset"],
): ViewDimensions => {
  // const isRowOrTable = viewAs === "row" || viewAs === "table";
  //  const isTileView = viewAs === "tile";
  const offsetValue = offset?.value ?? 0;

  return {
    width: rect.width + offsetValue,
    height: rect.height + offsetValue,
    top: rect.top - offsetValue / 2,
  };
};

const getLeftPosition = (
  rect: DOMRect,
  viewAs: string,
  offset: GuidancePosition["offset"],
  isRTL: boolean = false,
): number => {
  // if (isRTL && (viewAs === "row" || viewAs === "table")) {
  //   return 0;
  // }

  const offsetValue = (offset?.value ?? 0) / 2;
  const rowOffset = offset?.row ?? offsetValue;

  switch (viewAs) {
    case "row":
      return rect.left - rowOffset;
    default:
      return rect.left - offsetValue;
  }
};

const getExpandedPosition = (
  rect: DOMRect,
  offset: GuidancePosition["offset"],
  options: { useTabletSize?: boolean; expandHeight?: boolean } = {},
) => {
  const { useTabletSize = false, expandHeight = false } = options;
  const offsetValue = offset?.value ?? 0;

  const baseSize = useTabletSize
    ? rect.height + offsetValue * 2
    : expandHeight
      ? rect.height * 2
      : rect.height + offsetValue * 2;

  return {
    width: baseSize,
    height: baseSize,
    left: rect.left - offsetValue,
    top: rect.top - offsetValue,
    bottom: rect.bottom + offsetValue,
    right: rect.right,
  };
};

const getTableRowPosition = (
  rect: DOMRect,
  offset: GuidancePosition["offset"],
  type: GuidanceElementType,
  viewAs: string,
  isRTL: boolean = false,
) => {
  const offsetValue = offset?.value ?? 0;
  const rowOffset = offset?.row ?? offsetValue;
  const tableOffset = offset?.table ?? rowOffset;

  const leftPosition = getLeftPosition(rect, viewAs, offset, isRTL);

  return {
    width: 0,
    height: rect.height + tableOffset,
    left: isRTL ? 0 : leftPosition,
    top: rect.top - 1,
    bottom: rect.bottom,
    right: rect.right,
  };
};

const getPosition = (
  rects: DOMRect,
  offset: GuidancePosition["offset"],
  viewAs: string,
  type: GuidanceElementType,
  isRTL: boolean = false,
) => {
  if (type === GuidanceElementType.Content || viewAs === "tile") {
    const dimensions = getViewTypeBasedDimensions(rects, viewAs, offset);
    return {
      ...dimensions,
      left: getLeftPosition(rects, viewAs, offset, isRTL),
      bottom: rects.bottom,
      right: rects.right,
    };
  }

  // Special handling for table view

  return getTableRowPosition(rects, offset, type, viewAs, isRTL);
};

export const getGuidPosition = (
  guidance: GuidancePosition,
  viewAs: string,
  isRTL: boolean = false,
) => {
  if (!guidance?.rects) return DEFAULT_POSITION;

  const { rects, type, offset } = guidance;

  switch (type) {
    case GuidanceElementType.UploadArea:
      return getExpandedPosition(rects, offset, {
        useTabletSize: isTablet(),
        expandHeight: !isTablet(),
      });

    case GuidanceElementType.Interactive:
      return getExpandedPosition(rects, offset);

    case GuidanceElementType.Expandable:
      return getExpandedPosition(rects, offset, { expandHeight: true });

    case GuidanceElementType.Mixed:
      return getPosition(rects, offset, viewAs, type, isRTL);

    case GuidanceElementType.Content:
    default: {
      // Default position calculation based on view type
      return getPosition(rects, offset, viewAs, type, isRTL);
    }
  }
};
