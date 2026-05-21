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

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import { AutoBackupPeriod } from "../../../../../enums";
import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";

import type { ScheduleComponentProps } from "./ScheduleComponent.types";
import styles from "./ScheduleComponent.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const ScheduleComponent = ({
  selectedPeriodLabel,
  selectedWeekdayLabel,
  selectedHour,
  selectedMonthDay,
  selectedMaxCopiesNumber,
  setMaxCopies,
  setPeriod,
  setWeekday,
  setMonthNumber,
  setTime,
  isLoadingData,
  periodsObject,
  weekdaysLabelArray,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
  selectedPeriodNumber,
}: ScheduleComponentProps) => {
  const { t } = useTranslation(["Common"]);

  const { weeklySchedule, monthlySchedule } = useMemo(() => {
    const selectedPeriodNumberConverted = +selectedPeriodNumber;

    return {
      weeklySchedule:
        selectedPeriodNumberConverted === AutoBackupPeriod.EveryWeekType,
      monthlySchedule:
        selectedPeriodNumberConverted === AutoBackupPeriod.EveryMonthType,
    };
  }, [selectedPeriodNumber]);

  const renderHelpContent = () => (
    <Text
      className={classNames(styles.scheduleDescription, "schedule_description")}
      fontSize="12px"
    >
      {t("Common:AutoSavePeriodHelp", { productName: getBrandName("ProductName") })}
    </Text>
  );

  return (
    <div
      className={classNames(
        styles.scheduleComponent,
        "backup_schedule-component",
        {
          [styles.weeklySchedule]: weeklySchedule,
          [styles.monthlySchedule]: monthlySchedule,
        },
      )}
      data-testid="schedule-component"
    >
      <div
        className={classNames(
          styles.scheduleHelpSection,
          "schedule_help-section",
        )}
      >
        <Text
          className={classNames(
            styles.scheduleDescription,
            "schedule_description",
          )}
          fontSize="12px"
        >
          {t("Common:AutoSavePeriod")}
        </Text>
        <HelpButton
          className={classNames(
            styles.scheduleHelpButton,
            "schedule_help-button",
          )}
          iconName={HelpReactSvgUrl}
          getContent={renderHelpContent}
          tooltipMaxWidth="310px"
          place="right"
          offsetRight={0}
          tooltipContent={undefined}
          dataTestId="auto_save_perido_help_button"
        />
      </div>
      <div className={classNames(styles.mainOptions, "main_options")}>
        <ComboBox
          options={periodsObject}
          selectedOption={{
            key: 0,
            label: selectedPeriodLabel,
          }}
          onSelect={setPeriod}
          isDisabled={isLoadingData}
          noBorder={false}
          scaled={false}
          scaledOptions
          className={classNames(
            styles.scheduleBackupCombobox,
            styles.daysOption,
            "schedule-backup_combobox days_option",
          )}
          showDisabledItems
          directionY="both"
          dataTestId="auto_backup_period_combobox"
          dropDownTestId="auto_backup_period_dropdown"
        />
        {weeklySchedule ? (
          <ComboBox
            options={weekdaysLabelArray}
            selectedOption={{
              key: 0,
              label: selectedWeekdayLabel,
            }}
            onSelect={setWeekday}
            isDisabled={isLoadingData}
            noBorder={false}
            scaled
            scaledOptions
            dropDownMaxHeight={300}
            className={classNames(
              styles.scheduleBackupCombobox,
              styles.weeklyOption,
              "schedule-backup_combobox weekly_option",
            )}
            showDisabledItems
            directionY="both"
            dataTestId="auto_backup_weekday_combobox"
            dropDownTestId="auto_backup_weekday_dropdown"
          />
        ) : null}
        {monthlySchedule ? (
          <ComboBox
            options={monthNumbersArray}
            selectedOption={{
              key: 0,
              label: selectedMonthDay,
            }}
            onSelect={setMonthNumber}
            isDisabled={isLoadingData}
            noBorder={false}
            scaled={false}
            scaledOptions
            dropDownMaxHeight={300}
            className={classNames(
              styles.scheduleBackupCombobox,
              styles.monthOptions,
              "schedule-backup_combobox month_options",
            )}
            showDisabledItems
            directionY="both"
            dataTestId="auto_backup_month_combobox"
            dropDownTestId="auto_backup_month_dropdown"
          />
        ) : null}
        <ComboBox
          options={hoursArray}
          selectedOption={{
            key: 0,
            label: selectedHour,
          }}
          onSelect={setTime}
          isDisabled={isLoadingData}
          noBorder={false}
          scaled={false}
          scaledOptions
          dropDownMaxHeight={300}
          className={classNames(
            styles.scheduleBackupCombobox,
            styles.timeOptions,
            "schedule-backup_combobox time_options",
          )}
          showDisabledItems
          directionY="both"
          dataTestId="auto_backup_time_combobox"
          dropDownTestId="auto_backup_time_dropdown"
        />
      </div>
      <div className={classNames(styles.maxCopiesOption, "maxCopiesOption")}>
        <ComboBox
          options={maxNumberCopiesArray}
          selectedOption={{
            key: 0,
            label: `${t("Common:MaxCopies", {
              copiesCount: selectedMaxCopiesNumber,
            })}`,
          }}
          onSelect={setMaxCopies}
          isDisabled={isLoadingData}
          noBorder={false}
          scaled={false}
          scaledOptions
          dropDownMaxHeight={300}
          className={classNames(
            styles.scheduleBackupCombobox,
            styles.maxCopies,
            "schedule-backup_combobox max_copies",
          )}
          showDisabledItems
          directionY="both"
          dataTestId="auto_backup_max_copies_combobox"
          dropDownTestId="auto_backup_max_copies_dropdown"
          isDefaultMode={false}
        />
      </div>
    </div>
  );
};

export default ScheduleComponent;
