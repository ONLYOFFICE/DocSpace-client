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

import {
  GuidanceStep,
  GuidanceElementType,
  GuidanceRefKey,
} from "../sub-components/Guid.types";
import { GuidanceConfig } from "./configs.types";
import { getBrandName } from "@docspace/shared/constants/brands";

export const getFormFillingConfig = ({ t }: GuidanceConfig): GuidanceStep[] => [
  {
    id: 1,
    header: t("FormFillingTipsDialog:HeaderStarting"),
    description: t("FormFillingTipsDialog:TitleStarting"),
    key: "form-filling-starting",
    placement: "dynamic",
    position: [
      {
        type: GuidanceElementType.Mixed,
        refKey: GuidanceRefKey.Pdf,
        offset: {
          value: 4,
          row: 14,
          rtl: 22,
        },
      },
    ],
  },
  {
    id: 2,
    header: t("FormFillingTipsDialog:HeaderSharing"),
    description: t("FormFillingTipsDialog:TitleSharing", {
      productName: getBrandName("ProductName"),
    }),
    key: "form-filling-sharing",
    placement: "bottom",
    position: [
      {
        type: GuidanceElementType.Content,
        refKey: GuidanceRefKey.Share,
        offset: {
          left: -2,
          top: -2,
          width: 6,
          height: 5,
        },
        smallBorder: true,
      },
    ],
  },
  {
    id: 3,
    header: t("FormFillingTipsDialog:HeaderSubmitting"),
    description: t("FormFillingTipsDialog:TitleSubmitting"),
    key: "form-filling-submitting",
    placement: "bottom",
    position: [
      {
        type: GuidanceElementType.Mixed,
        refKey: GuidanceRefKey.Ready,
        offset: {
          value: 4,
          row: 14,
          rtl: 22,
        },
      },
    ],
  },
  {
    id: 4,
    header: t("FormFillingTipsDialog:HeaderComplete"),
    description: t("FormFillingTipsDialog:TitleComplete"),
    key: "form-filling-complete",
    placement: "bottom",
    position: [
      {
        type: GuidanceElementType.Mixed,
        refKey: GuidanceRefKey.Ready,
        offset: {
          value: 4,
          row: 14,
          rtl: 22,
        },
      },
    ],
  },
  {
    id: 5,
    header: t("FormFillingTipsDialog:HeaderUploading"),
    description: t("FormFillingTipsDialog:DescriptionUploading", {
      productName: getBrandName("ProductName"),
      sectionName: t("Common:Files"),
    }),
    key: "form-filling-uploading",
    placement: "side",
    position: [
      {
        type: GuidanceElementType.Content,
        refKey: GuidanceRefKey.MainButton,
        offset: {
          value: 2,
        },
        smallBorder: true,
      },
      {
        type: GuidanceElementType.Expandable,
        refKey: GuidanceRefKey.Uploading,
        size: 35,
        offset: {
          value: 9,
        },
        smallBorder: true,
      },
    ],
  },
];
