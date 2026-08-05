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

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import ExpanderDownIcon from "@docspace/ui-kit/assets/expander-down.react.svg";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { RadioButtonGroup } from "@docspace/ui-kit/components/radio-button-group";
import { Text } from "@docspace/ui-kit/components/text";
import { useClickOutside } from "@docspace/ui-kit/utils/use-click-outside";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";

import { ExportDateRange } from "../ExportDateRange";
import { ExportScope, type ExportMenuProps } from "./ExportMenu.types";
import { getDefaultDateRange, toReportDateRange } from "./ExportMenu.utils";
import styles from "./ExportMenu.module.scss";

export const ExportMenu = ({
  isReportGenerating,
  earliestDate,
  locale,
  onExport,
}: ExportMenuProps) => {
  const { t } = useTranslation(["InfoPanel", "Common"]);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [exportScope, setExportScope] = useState(ExportScope.AllHistory);
  const [dateRange, setDateRange] = useState(() =>
    getDefaultDateRange(earliestDate),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const closePopup = useEventCallback(() => setIsPopupOpen(false));

  useClickOutside(containerRef, closePopup);

  const isDateRangeScope = exportScope === ExportScope.DateRange;

  const onExportScopeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExportScope(event.target.value as ExportScope);
  };

  const onExportClick = () => {
    closePopup();
    onExport(isDateRangeScope ? toReportDateRange(dateRange) : undefined);
  };

  const exportScopeOptions = [
    {
      id: "info_history_export_all",
      value: ExportScope.AllHistory,
      label: t("InfoPanel:AllHistory"),
    },
    {
      id: "info_history_export_date-range",
      value: ExportScope.DateRange,
      label: t("Common:DateRange"),
    },
  ];

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        className={classNames(styles.button, {
          [styles.opened]: isPopupOpen,
        })}
        onClick={() => setIsPopupOpen((isOpen) => !isOpen)}
        disabled={isReportGenerating}
        data-testid="info_history_export"
      >
        <span className={styles.label}>{t("InfoPanel:ExportHistory")}</span>

        <span className={styles.indicator}>
          {isReportGenerating ? (
            <Loader
              id="info_history-export-loader"
              className={styles.loader}
              color=""
              size="16px"
              type={LoaderTypes.track}
            />
          ) : (
            <ExpanderDownIcon className={styles.icon} />
          )}
        </span>
      </button>

      {isPopupOpen ? (
        <div className={styles.popup} data-testid="info_history_export_popup">
          <div className={styles.settings}>
            <div>
              <Text fontSize="16px" fontWeight={700} lineHeight="22px">
                {t("InfoPanel:ExportHistory")}
              </Text>

              <Text
                className={styles.description}
                fontSize="13px"
                lineHeight="20px"
              >
                {t("InfoPanel:ExportHistoryDescription")}
              </Text>
            </div>

            <RadioButtonGroup
              name="info_history_export_scope"
              orientation="vertical"
              spacing="8px"
              fontSize="13px"
              fontWeight={400}
              options={exportScopeOptions}
              selected={exportScope}
              onClick={onExportScopeChange}
              dataTestId="info_history_export_scope"
            />

            {isDateRangeScope ? (
              <ExportDateRange
                dateRange={dateRange}
                earliestDate={earliestDate}
                locale={locale}
                onChange={setDateRange}
              />
            ) : null}
          </div>

          <div className={styles.actions}>
            <Button
              className={styles.submitButton}
              primary
              size={ButtonSize.normal}
              label={t("Common:Export")}
              onClick={onExportClick}
              testId="info_history_export_submit"
            />

            <Button
              size={ButtonSize.normal}
              label={t("Common:CancelButton")}
              onClick={closePopup}
              testId="info_history_export_cancel"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
