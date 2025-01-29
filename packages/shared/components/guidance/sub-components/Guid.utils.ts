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

export const getGuidPosition = (
  guidRects: GuidRectsProps,
  state: number,
  viewAs: string,
) => {
  switch (state) {
    case FormFillingTipsState.Starting:
      return {
        width:
          viewAs === "row" || viewAs === "table"
            ? 0
            : guidRects.pdf.width + TILE_VIEW_OFFSET,
        height:
          viewAs === "tile"
            ? guidRects.pdf.height + TILE_VIEW_OFFSET
            : guidRects.pdf.height,
        left:
          viewAs === "row"
            ? guidRects.pdf.left - ROW_VIEW_OFFSET
            : viewAs === "tile"
              ? guidRects.pdf.left - TILE_VIEW_POSITION_OFFSET
              : guidRects.pdf.left,
        top:
          viewAs === "tile"
            ? guidRects.pdf.top - TILE_VIEW_POSITION_OFFSET
            : guidRects.pdf.top,
        bottom: guidRects.pdf.bottom,
        right: guidRects.pdf.right,
      };

    case FormFillingTipsState.Sharing:
      return {
        width: guidRects.share.width + GUID_SHARE_OFFSET * 2,
        height: guidRects.share.height + GUID_SHARE_OFFSET * 2,
        left: guidRects.share.left - GUID_SHARE_OFFSET,
        top: guidRects.share.top - GUID_SHARE_OFFSET,
        bottom: guidRects.share.bottom,
        right: guidRects.share.right,
      };

    case FormFillingTipsState.Submitting:
    case FormFillingTipsState.Complete:
      return {
        width:
          viewAs === "row" || viewAs === "table"
            ? 0
            : guidRects.ready.width + TILE_VIEW_OFFSET,
        height:
          viewAs === "tile"
            ? guidRects.ready.height + TILE_VIEW_OFFSET
            : guidRects.ready.height,
        left:
          viewAs === "row"
            ? guidRects.ready.left - ROW_VIEW_OFFSET
            : viewAs === "tile"
              ? guidRects.ready.left - TILE_VIEW_POSITION_OFFSET
              : guidRects.ready.left,
        top:
          viewAs === "tile"
            ? guidRects.ready.top - TILE_VIEW_POSITION_OFFSET
            : guidRects.ready.top,
        bottom: guidRects.ready.bottom,
        right: guidRects.ready.right,
      };

    case FormFillingTipsState.Uploading:
      return {
        width: isTablet()
          ? guidRects.uploading.width + GUID_UPLOADING_OFFSET * 2
          : guidRects.uploading.width * 2,
        height: isTablet()
          ? guidRects.uploading.height + GUID_UPLOADING_OFFSET * 2
          : guidRects.uploading.height * 2,
        left: guidRects.uploading.left - GUID_UPLOADING_OFFSET,
        top: guidRects.uploading.top - GUID_UPLOADING_OFFSET,
        bottom: guidRects.uploading.bottom + GUID_UPLOADING_OFFSET,
        right: guidRects.uploading.right,
      };

    default:
      return {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
      };
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
