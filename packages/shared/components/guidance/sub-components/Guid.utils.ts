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

const GUID_SHARE_OFFSET = 2;
const GUID_UPLOADING_OFFSET = 5;

export const getGuidPosition = (guidRects, state, viewAs) => {
  switch (state) {
    case FormFillingTipsState.Starting:
      return {
        width: viewAs === "table" ? 0 : guidRects.pdf.width,
        height: guidRects.pdf.height,
        left: guidRects.pdf.left,
        top: guidRects.pdf.top,
        bottom: guidRects.pdf.bottom,
      };

    case FormFillingTipsState.Sharing:
      return {
        width: guidRects.share.width + GUID_SHARE_OFFSET * 2,
        height: guidRects.share.height + GUID_SHARE_OFFSET * 2,
        left: guidRects.share.left - GUID_SHARE_OFFSET,
        top: guidRects.share.top - GUID_SHARE_OFFSET,
        bottom: guidRects.share.bottom,
      };

    case FormFillingTipsState.Submitting:
    case FormFillingTipsState.Complete:
      return {
        width: viewAs === "table" ? 0 : guidRects.ready.width,
        height: guidRects.ready.height,
        left: guidRects.ready.left,
        top: guidRects.ready.top,
        bottom: guidRects.ready.bottom,
      };

    case FormFillingTipsState.Uploading:
      return {
        width: guidRects.uploading.width + GUID_UPLOADING_OFFSET * 2,
        height: guidRects.uploading.height + GUID_UPLOADING_OFFSET * 2,
        left: guidRects.uploading.left - GUID_UPLOADING_OFFSET,
        top: guidRects.uploading.top - GUID_UPLOADING_OFFSET,
        bottom: guidRects.uploading.bottom,
      };

    default:
      return {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        bottom: 0,
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
        description: t("TitleSharing"),
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
        description: t("TitleUploading"),
      };

    default:
      return null;
  }
};
