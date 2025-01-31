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

const GUID_SHARE_OFFSET = 2;
const GUID_UPLOADING_OFFSET = 9;
const ROW_VIEW_OFFSET = 15;
const TILE_VIEW_OFFSET = 4;
const TILE_VIEW_POSITION_OFFSET = 2;

type GuidRectsProps = {
  pdf: DOMRect;
  ready: DOMRect;
  share: DOMRect;
  uploading: DOMRect;
};

const DEFAULT_POSITION = {
  width: 0,
  height: 0,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
} as const;

const getViewTypeBasedDimensions = (rect: DOMRect, viewAs: string) => {
  const isRowOrTable = viewAs === "row" || viewAs === "table";
  const isTileView = viewAs === "tile";

  return {
    width: isRowOrTable ? 0 : rect.width + TILE_VIEW_OFFSET,
    height: isTileView ? rect.height + TILE_VIEW_OFFSET : rect.height,
    top: isTileView ? rect.top - TILE_VIEW_POSITION_OFFSET : rect.top,
  };
};

const getLeftPosition = (rect: DOMRect, viewAs: string, isRTL?: boolean) => {
  if (isRTL && (viewAs === "row" || viewAs === "table")) {
    return 0;
  }

  switch (viewAs) {
    case "row":
      return rect.left - ROW_VIEW_OFFSET;
    case "tile":
      return rect.left - TILE_VIEW_POSITION_OFFSET;
    default:
      return rect.left;
  }
};

const getUploadingPosition = (rect: DOMRect) => {
  const offset = GUID_UPLOADING_OFFSET;
  const baseSize = isTablet() ? rect.height + offset * 2 : rect.height * 2;

  return {
    width: baseSize,
    height: baseSize,
    left: rect.left - offset,
    top: rect.top - offset,
    bottom: rect.bottom + offset,
    right: rect.right,
  };
};

export const getMainButtonPosition = (rect: DOMRect) => {
  if (!rect) return DEFAULT_POSITION;

  const offset = GUID_SHARE_OFFSET;
  return {
    width: rect.width + offset * 2,
    height: rect.height + offset * 2,
    left: rect.left - offset,
    top: rect.top - offset,
    bottom: rect.bottom,
    right: rect.right,
  };
};

const getSharingPosition = (rect: DOMRect) => {
  const offset = GUID_SHARE_OFFSET;
  return {
    width: rect.width + offset * 2,
    height: rect.height + offset * 2,
    left: rect.left - offset,
    top: rect.top - offset,
    bottom: rect.bottom,
    right: rect.right,
  };
};

const getStandardPosition = (
  rect: DOMRect,
  viewAs: string,
  isRTL?: boolean,
) => {
  const dimensions = getViewTypeBasedDimensions(rect, viewAs);
  const isTableMode = viewAs === "table";

  return {
    ...dimensions,
    left: getLeftPosition(rect, viewAs, isRTL),
    top: isTableMode ? dimensions.top + 1 : dimensions.top,
    height: isTableMode
      ? (dimensions.height || rect.height) + 3
      : dimensions.height || rect.height,
    bottom: rect.bottom,
    right: rect.right,
  };
};

export const getGuidPosition = (
  guidRects: GuidRectsProps,
  state: number,
  viewAs: string,
  isRTL?: boolean,
) => {
  switch (state) {
    case FormFillingTipsState.Starting:
      return getStandardPosition(guidRects.pdf, viewAs, isRTL);

    case FormFillingTipsState.Sharing:
      return getSharingPosition(guidRects.share);

    case FormFillingTipsState.Submitting:
    case FormFillingTipsState.Complete:
      return getStandardPosition(guidRects.ready, viewAs, isRTL);

    case FormFillingTipsState.Uploading:
      return getUploadingPosition(guidRects.uploading);

    default:
      return DEFAULT_POSITION;
  }
};

export const getHeaderText = (state: number, t: TTranslation) => {
  switch (state) {
    case FormFillingTipsState.Starting:
      return {
        header: t("HeaderStarting"),
        description: t("TitleStarting"),
      };
    case FormFillingTipsState.Sharing:
      return {
        header: t("HeaderSharing"),
        description: t("TitleSharing", {
          productName: t("Common:ProductName"),
        }),
      };
    case FormFillingTipsState.Submitting:
      return {
        header: t("HeaderSubmitting"),
        description: t("TitleSubmitting"),
      };
    case FormFillingTipsState.Complete:
      return {
        header: t("HeaderComplete"),
        description: t("TitleComplete"),
      };
    case FormFillingTipsState.Uploading:
      return {
        header: t("HeaderUploading"),
        description: t("TitleUploading", {
          productName: t("Common:ProductName"),
        }),
      };

    default:
      return null;
  }
};
