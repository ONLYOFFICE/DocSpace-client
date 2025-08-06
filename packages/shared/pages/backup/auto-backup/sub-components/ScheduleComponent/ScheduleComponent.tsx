// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";

import { Text } from "../../../../../components/text";
import { AutoBackupPeriod } from "../../../../../enums";
import { ComboBox } from "../../../../../components/combobox";
import { HelpButton } from "../../../../../components/help-button";

import type { ScheduleComponentProps } from "./ScheduleComponent.types";
import styles from "./ScheduleComponent.module.scss";

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
      {t("Common:AutoSavePeriodHelp", { productName: t("Common:ProductName") })}
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
        />
      </div>
    </div>
  );
};

export default ScheduleComponent;
