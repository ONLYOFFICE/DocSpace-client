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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { RowContainer } from "@docspace/ui-kit/components/rows";
import { Text } from "@docspace/ui-kit/components/text";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";

import ExternalLinkIcon from "PUBLIC_DIR/images/external.link.12.react.svg";

import type ServicesStore from "SRC_DIR/store/ServicesStore";

import { useTurnOffModelConfirmation } from "../TurnOffModelDialog";

import styles from "./ModelSettingsRowView.module.scss";

type TModelRow = {
  id: string;
  alias: string;
  image: string;
  link?: string;
  prices: string[];
};

type ModelSettingsRowViewProps = {
  sectionWidth: number;

  aiToolsPrices?: ServicesStore["aiToolsPrices"];
  formatAiModelsCurrency?: ServicesStore["formatAiModelsCurrency"];
  setAiModelAvailability?: ServicesStore["setAiModelAvailability"];
  aiModelAvailabilityMap?: ServicesStore["aiModelAvailabilityMap"];
  aiModelAvailabilityUpdatingSet?: ServicesStore["aiModelAvailabilityUpdatingSet"];
  isAiToolsServiceOn?: boolean;
};

const RowView = (props: ModelSettingsRowViewProps) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
    isAiToolsServiceOn,
  } = props;

  const { t } = useTranslation(["Common"]);

  const { requestToggle, turnOffModelDialog } =
    useTurnOffModelConfirmation(setAiModelAvailability);

  const formatPrice = (value?: number) =>
    value == null ? "" : (formatAiModelsCurrency?.(value) ?? "");

  const chatRows: TModelRow[] = (aiToolsPrices?.chat ?? []).map((m) => ({
    id: m.id,
    alias: m.alias,
    image: m.image,
    link: m.link,
    prices: [
      t("Common:AIModelPrice", {
        inputPrice: formatPrice(m.price?.prompt),
        outputPrice: formatPrice(m.price?.completion),
      }),
    ],
  }));

  const imageRows: TModelRow[] = (aiToolsPrices?.image ?? []).map((m) => ({
    id: m.id,
    alias: m.alias,
    image: m.image,
    link: m.link,
    prices: [
      t("Common:AIImageModelPrice", {
        inputPrice: formatPrice(m.price?.prompt),
        imagePrice: formatPrice(m.price?.image),
      }),
      t("Common:AIModelOutputPrice", {
        outputPrice: formatPrice(m.price?.completion),
      }),
    ],
  }));

  if (!chatRows.length && !imageRows.length) return null;

  const renderRows = (rows: TModelRow[], id: string, itemHeight: number) => (
    <RowContainer
      id={id}
      useReactWindow
      fetchMoreFiles={() => Promise.resolve()}
      hasMoreFiles={false}
      itemCount={rows.length}
      filesLength={rows.length}
      itemHeight={itemHeight}
    >
      {rows.map((row) => {
        const enabled = aiModelAvailabilityMap?.get(row.id) ?? true;
        const isUpdating = aiModelAvailabilityUpdatingSet?.has(row.id) ?? false;

        const onRowClick = () => {
          if (row.link) window.open(row.link, "_blank", "noopener,noreferrer");
        };

        return (
          <div
            className={styles.row}
            key={row.id}
            onClick={row.link ? onRowClick : undefined}
            data-has-link={row.link ? "true" : undefined}
          >
            <div className={styles.modelIcon}>
              <div
                className={styles.iconInner}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: TODO fix
                dangerouslySetInnerHTML={{ __html: row.image }}
              />
            </div>

            <div className={styles.content}>
              <div className={styles.titleRow}>
                <Text fontSize="14px" fontWeight={600} className={styles.title}>
                  {row.alias}
                </Text>
                {row.link ? (
                  <ExternalLinkIcon className={styles.detailsIcon} />
                ) : null}
              </div>

              {row.prices.map((price) => (
                <Text key={price} fontSize="12px" className={styles.prices}>
                  {price}
                </Text>
              ))}
            </div>

            <div className={styles.toggle} onClick={(e) => e.stopPropagation()}>
              <ToggleButton
                isChecked={enabled}
                onChange={() =>
                  requestToggle({ id: row.id, title: row.alias }, !enabled)
                }
                isDisabled={isUpdating || !isAiToolsServiceOn}
                dataTestId={`ai_model_toggle_${row.id}`}
              />
            </div>
          </div>
        );
      })}
    </RowContainer>
  );

  return (
    <div className={styles.rowContainer}>
      <Text className={styles.introText}>
        {t("Common:AIModelsDescription")}
      </Text>

      {chatRows.length ? (
        <React.Fragment>
          <Text fontSize="16px" fontWeight={700} className={styles.groupTitle}>
            {t("Common:AITextModels")}
          </Text>
          {renderRows(chatRows, "rowContainer", 72)}
        </React.Fragment>
      ) : null}

      {imageRows.length ? (
        <React.Fragment>
          <Text
            fontSize="16px"
            fontWeight={700}
            className={styles.groupTitle}
            dataTestId="ai-image-models-title"
          >
            {t("Common:AIImageModels")}
          </Text>
          {renderRows(imageRows, "imageRowContainer", 88)}
        </React.Fragment>
      ) : null}

      {turnOffModelDialog}
    </div>
  );
};

export default inject<TStore>(({ servicesStore, paymentStore }) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
  } = servicesStore;
  const { isAiToolsServiceOn } = paymentStore;

  return {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
    isAiToolsServiceOn,
  };
})(observer(RowView));
