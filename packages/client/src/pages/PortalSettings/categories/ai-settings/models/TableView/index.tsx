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

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TableBody, TableContainer } from "@docspace/ui-kit/components/table";
import { Text } from "@docspace/ui-kit/components/text";

import type ServicesStore from "SRC_DIR/store/ServicesStore";
import type { UserStore } from "@docspace/shared/store/UserStore";

import { useDisableModelConfirmation } from "../DisableModelDialog";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import styles from "./ModelSettingsTable.module.scss";

const TABLE_VERSION = "3";
const COLUMNS_SIZE = `aiModelsColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelAiModelsColumnsSize_ver-${TABLE_VERSION}`;

type ModelSettingsTableViewProps = {
  sectionWidth: number;

  userId?: string;
  aiToolsPrices?: ServicesStore["aiToolsPrices"];
  formatAiModelsCurrency?: ServicesStore["formatAiModelsCurrency"];
  setAiModelAvailability?: ServicesStore["setAiModelAvailability"];
  aiModelAvailabilityMap?: ServicesStore["aiModelAvailabilityMap"];
  aiModelAvailabilityUpdatingSet?: ServicesStore["aiModelAvailabilityUpdatingSet"];
};

const TableView = (props: ModelSettingsTableViewProps) => {
  const {
    sectionWidth,
    userId,
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
  } = props;

  const { t } = useTranslation(["Common"]);

  const models = [
    ...(aiToolsPrices?.chat ?? []),
    ...(aiToolsPrices?.image ?? []),
  ];

  const { requestToggle, disableModelDialog } =
    useDisableModelConfirmation(setAiModelAvailability);

  const onToggle = (modelId: string, enabled: boolean) => {
    const model = models.find((m) => m.id === modelId);

    requestToggle({ id: modelId, title: model?.alias ?? modelId }, enabled);
  };

  const ref = useRef<HTMLDivElement>(null);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <div className={styles.tableWrapper}>
      <Text className={styles.introText}>
        {t("Common:AIModelsDescription")}
      </Text>

      <TableContainer
        forwardedRef={ref as React.RefObject<HTMLDivElement>}
        useReactWindow={false}
        className={styles.tableContainer}
      >
        <TableHeader
          sectionWidth={sectionWidth}
          containerRef={ref as React.RefObject<HTMLDivElement>}
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          itemHeight={48}
        />
        <TableBody
          useReactWindow
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          itemHeight={48}
          filesLength={models.length}
          fetchMoreFiles={() => Promise.resolve()}
          hasMoreFiles={false}
          itemCount={models.length}
        >
          {models.map((m) => (
            <TableRow
              key={m.id}
              modelId={m.id}
              title={m.alias}
              inputPrice={
                m.price?.prompt != null
                  ? (formatAiModelsCurrency?.(m.price.prompt) ?? "")
                  : ""
              }
              outputPrice={(() => {
                const outputValue = m.price?.completion;

                return outputValue != null
                  ? (formatAiModelsCurrency?.(outputValue) ?? "")
                  : "";
              })()}
              enabled={aiModelAvailabilityMap?.get(m.id) ?? true}
              isUpdating={aiModelAvailabilityUpdatingSet?.has(m.id) ?? false}
              onToggle={onToggle}
              image={m.image}
              link={m.link}
            />
          ))}
        </TableBody>
      </TableContainer>

      {disableModelDialog}
    </div>
  );
};

export default inject<TStore>(({ servicesStore, userStore }) => {
  const {
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
  } = servicesStore;

  const { user } = userStore as UserStore;

  return {
    userId: user?.id,
    aiToolsPrices,
    formatAiModelsCurrency,
    setAiModelAvailability,
    aiModelAvailabilityMap,
    aiModelAvailabilityUpdatingSet,
  };
})(observer(TableView));
