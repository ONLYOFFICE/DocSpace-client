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

import type { TFunction } from "i18next";

import type { DataTableColumn } from "@onlyoffice/apps-ui-kit/components/data-table";

import { DetailsCell, ModelCell, PriceCell, ToggleCell } from "./AiModelsCells";
import type { TModelRow, TPriceKey, TRequestToggle } from "./aiModelsTypes";

const priceColumn = (
  id: string,
  priceKey: TPriceKey,
  title: string,
): DataTableColumn<TModelRow> => ({
  id,
  title,
  width: { type: "flex", min: 90 },
  cell: (row) => (
    <PriceCell price={row.prices.find(({ key }) => key === priceKey)} />
  ),
});

/**
 * The model, its three prices, the switch and the link. Both tables have the
 * same number of flexible columns and the same fixed ones, so they line up.
 */
export const getAiModelsColumns = (
  t: TFunction,
  currency: string,
  isImage: boolean,
  onToggle: TRequestToggle,
): DataTableColumn<TModelRow>[] => {
  const output = priceColumn(
    "Output",
    "output",
    t("Common:OutputCurrency", { currency }),
  );

  const prices = isImage
    ? [
        priceColumn(
          "ImageInput",
          "imageInput",
          t("Common:ImageInputCurrency", { currency }),
        ),
        priceColumn(
          "ImageOutput",
          "imageOutput",
          t("Common:ImageOutputCurrency", { currency }),
        ),
        output,
      ]
    : [
        priceColumn("Input", "input", t("Common:InputCurrency", { currency })),
        output,
        priceColumn(
          "CachedInput",
          "cachedInput",
          t("Common:CachedInputCurrency", { currency }),
        ),
      ];

  return [
    {
      id: "Model",
      title: t("Common:Name"),
      width: { type: "fill", min: 180 },
      cell: (row) => <ModelCell row={row} />,
    },
    ...prices,
    {
      id: "OffOn",
      title: t("Common:OffOn"),
      width: { type: "fixed", size: 76 },
      cell: (row) => <ToggleCell row={row} onToggle={onToggle} />,
    },
    {
      id: "Details",
      title: t("Common:ModelDetails"),
      width: { type: "fixed", size: 120 },
      cell: (row) => <DetailsCell link={row.link} />,
    },
  ];
};
