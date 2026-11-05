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

import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import {
  DataTable,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import type ServicesStore from "SRC_DIR/store/ServicesStore";
import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";

import { useTurnOffModelConfirmation } from "../TurnOffModelDialog";
import {
  buildCachePriceBreakdown,
  CachePriceTooltip,
} from "../CachePriceTooltip";
import { getAiModelsColumns } from "./aiModelsColumns";
import type { TModelRow } from "./aiModelsTypes";
import styles from "./ModelSettingsTable.module.scss";

type ModelSettingsTableViewProps = {
  sectionWidth: number;

  aiToolsPrices?: ServicesStore["aiToolsPrices"];
  formatAiModelPrice?: ServicesStore["formatAiModelPrice"];
  aiModelsCurrencySymbol?: ServicesStore["aiModelsCurrencySymbol"];
  setAiModelAvailability?: ServicesStore["setAiModelAvailability"];
};

const NO_PRICE = () => "";

const getRowKey = (row: TModelRow) => row.id;

// Nothing happens on a click on a row, so it is not tinted under the pointer.
const ROW_PROPS: DataTableRowState = { hover: false };
const getRowProps = () => ROW_PROPS;

/**
 * The AI models on the ui-kit DataTable: one table for text models, one for
 * image models. Their widths are not stored, as the old header reset them on
 * every visit, so that the two tables line up.
 */
const TableView = ({
  aiToolsPrices,
  formatAiModelPrice = NO_PRICE,
  aiModelsCurrencySymbol = "$",
  setAiModelAvailability,
}: ModelSettingsTableViewProps) => {
  const { t } = useTranslation(["Common"]);

  const { requestToggle, turnOffModelDialog } = useTurnOffModelConfirmation(
    setAiModelAvailability,
  );

  const chatRows = useMemo(
    (): TModelRow[] =>
      (aiToolsPrices?.chat ?? []).map((m) => ({
        id: m.id,
        alias: m.alias,
        image: m.image,
        link: m.link,
        prices: [
          { key: "input", value: formatAiModelPrice(m.price?.prompt) },
          { key: "output", value: formatAiModelPrice(m.price?.completion) },
          {
            key: "cachedInput",
            value: formatAiModelPrice(m.price?.promptCacheRead),
            breakdown: buildCachePriceBreakdown(
              m.price,
              aiModelsCurrencySymbol,
              formatAiModelPrice,
            ),
          },
        ],
      })),
    [aiToolsPrices, formatAiModelPrice, aiModelsCurrencySymbol],
  );

  const imageRows = useMemo(
    (): TModelRow[] =>
      (aiToolsPrices?.image ?? []).map((m) => ({
        id: m.id,
        alias: m.alias,
        image: m.image,
        link: m.link,
        prices: [
          { key: "imageInput", value: formatAiModelPrice(m.price?.prompt) },
          { key: "imageOutput", value: formatAiModelPrice(m.price?.image) },
          { key: "output", value: formatAiModelPrice(m.price?.completion) },
        ],
      })),
    [aiToolsPrices, formatAiModelPrice],
  );

  const chatColumns = useMemo(
    () => getAiModelsColumns(t, aiModelsCurrencySymbol, false, requestToggle),
    [t, aiModelsCurrencySymbol, requestToggle],
  );

  const imageColumns = useMemo(
    () => getAiModelsColumns(t, aiModelsCurrencySymbol, true, requestToggle),
    [t, aiModelsCurrencySymbol, requestToggle],
  );

  const tableClassName = classNames(
    sectionTableStyles.settingsTable,
    styles.table,
  );

  return (
    <div className={styles.tableWrapper}>
      <Text className={styles.introText}>
        {t("Common:AIModelsDescription")}
      </Text>

      {chatRows.length ? (
        <>
          <Text fontSize="16px" fontWeight={700} className={styles.groupTitle}>
            {t("Common:AITextModels")}
          </Text>
          <DataTable<TModelRow>
            ariaLabel={t("Common:AITextModels")}
            columns={chatColumns}
            rows={chatRows}
            getRowKey={getRowKey}
            getRowProps={getRowProps}
            className={tableClassName}
            headerClassName={styles.header}
          />
        </>
      ) : null}

      {imageRows.length ? (
        <>
          <Text
            fontSize="16px"
            fontWeight={700}
            className={styles.groupTitle}
            dataTestId="ai-image-models-title"
          >
            {t("Common:AIImageModels")}
          </Text>
          <DataTable<TModelRow>
            ariaLabel={t("Common:AIImageModels")}
            columns={imageColumns}
            rows={imageRows}
            getRowKey={getRowKey}
            getRowProps={getRowProps}
            className={tableClassName}
            headerClassName={styles.header}
          />
        </>
      ) : null}

      <CachePriceTooltip />
      {turnOffModelDialog}
    </div>
  );
};

export default inject<TStore>(({ servicesStore }) => {
  const {
    aiToolsPrices,
    formatAiModelPrice,
    aiModelsCurrencySymbol,
    setAiModelAvailability,
  } = servicesStore;

  return {
    aiToolsPrices,
    formatAiModelPrice,
    aiModelsCurrencySymbol,
    setAiModelAvailability,
  };
})(observer(TableView));
