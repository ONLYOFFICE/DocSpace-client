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

import { isTablet } from "../../../utils";
import { ADDITIONAL_ROW_LEFT_RTL_OFFSET } from "./Guid.constants";
import {
  GuidancePosition,
  GuidanceElementType,
  ClippedPosition,
} from "./Guid.types";

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

interface Position extends ViewDimensions {
  left: number;
  bottom: number;
  right: number;
}

const getOffsetValues = (offset: GuidancePosition["offset"]) => {
  const baseOffset = (offset?.value ?? 0) / 2;
  return {
    base: baseOffset,
    row: offset?.row ?? baseOffset,
    rtl: offset?.rtl ?? 0,
  };
};

const getMixedRtlLeftPosition = (
  rect: DOMRect,
  viewAs: string,
  rtlOffset: number,
): number => {
  if (viewAs === "row") {
    return rect.left - rtlOffset + ADDITIONAL_ROW_LEFT_RTL_OFFSET;
  }
  return rect.left + rtlOffset;
};

const getLeftPosition = (
  rect: DOMRect,
  viewAs: string,
  offset: GuidancePosition["offset"],
  type: GuidanceElementType,
  isRTL: boolean = false,
): number => {
  const { base, row, rtl } = getOffsetValues(offset);

  if (isRTL && type === GuidanceElementType.Mixed && viewAs !== "tile") {
    return getMixedRtlLeftPosition(rect, viewAs, rtl);
  }

  if (viewAs === "tile" || type === GuidanceElementType.Content) {
    return viewAs === "row" ? rect.left - row : rect.left - base;
  }

  return viewAs === "row" ? rect.left - row : rect.left + base;
};

const getViewTypeBasedDimensions = (
  rect: DOMRect,
  viewAs: string,
  offset: GuidancePosition["offset"],
  options: { width?: number; heightOffset?: number } = {},
): ViewDimensions => {
  const offsetValue = offset?.value ?? 0;
  const hasWidth = "width" in options;
  const heightOffset = options?.heightOffset ?? 0;

  return {
    width: hasWidth ? options.width! : rect.width + offsetValue,
    height: rect.height + offsetValue - heightOffset,
    top: rect.top - offsetValue / 2,
  };
};

const getExpandedPosition = (
  rect: DOMRect,
  offset: GuidancePosition["offset"],
  options: { useTabletSize?: boolean; expandSize?: number } = {},
): Position => {
  const { useTabletSize = false, expandSize } = options;
  const offsetValue = offset?.value ?? 0;

  const baseSize = useTabletSize
    ? rect.height + offsetValue * 2
    : expandSize || rect.height + offsetValue * 2;

  return {
    width: baseSize,
    height: baseSize,
    left: rect.left - offsetValue,
    top: rect.top - offsetValue,
    bottom: rect.bottom + offsetValue,
    right: rect.right + offsetValue,
  };
};

const getPosition = (
  rects: DOMRect,
  offset: GuidancePosition["offset"],
  viewAs: string,
  type: GuidanceElementType,
  isRTL: boolean = false,
): ClippedPosition => {
  if (
    offset?.left !== undefined &&
    offset?.top !== undefined &&
    offset?.width !== undefined &&
    offset?.height !== undefined
  ) {
    return {
      left: rects.left + offset.left,
      top: rects.top + offset.top,
      width: rects.width + offset.width,
      height: rects.height + offset.height,
      bottom: rects.bottom + offset.height,
      right: rects.right + offset.width,
    };
  }

  const dimensions =
    viewAs === "tile" || type === GuidanceElementType.Content
      ? getViewTypeBasedDimensions(rects, viewAs, offset)
      : getViewTypeBasedDimensions(rects, viewAs, offset, {
          width: 0,
          heightOffset: 1,
        });

  return {
    ...dimensions,
    left: getLeftPosition(rects, viewAs, offset, type, isRTL),
    bottom: rects.bottom,
    right: rects.right,
  };
};

export const getGuidPosition = (
  guidance: GuidancePosition,
  viewAs: string,
  isRTL: boolean = false,
): ClippedPosition => {
  if (!guidance?.rects) return DEFAULT_POSITION;

  const { rects, type, offset, size } = guidance;

  switch (type) {
    case GuidanceElementType.Expandable:
      return getExpandedPosition(rects, offset, {
        useTabletSize: isTablet(),
        expandSize: !isTablet() ? size : 0,
      });

    case GuidanceElementType.Mixed:
    case GuidanceElementType.Content:
    default:
      return getPosition(rects, offset, viewAs, type, isRTL);
  }
};

export const getDynamicPlacement = (viewAs: string) => {
  return viewAs === "tile" ? "side" : "bottom";
};
