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

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { ComboBox } from "@docspace/shared/components/combobox";
import { Text } from "@docspace/shared/components/text";
import { StyledScheduleComponent } from "../../StyledBackup";
import { AutoBackupPeriod } from "@docspace/shared/enums";

import { HelpButton } from "@docspace/shared/components/help-button";

const { EveryWeekType, EveryMonthType } = AutoBackupPeriod;
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
  weeklySchedule,
  monthNumbersArray,
  hoursArray,
  maxNumberCopiesArray,
  monthlySchedule,
}) => {
  const { t } = useTranslation("Settings");
  const renderHelpContent = () => (
    <Text className="schedule_description" fontSize="12px">
      {t("AutoSavePeriodHelp")}
    </Text>
  );

  return (
    <StyledScheduleComponent
      weeklySchedule={weeklySchedule}
      monthlySchedule={monthlySchedule}
      className="backup_schedule-component"
    >
      <div className="schedule_help-section">
        <Text className="schedule_description" fontSize="12px">
          {t("AutoSavePeriod")}
        </Text>
        <HelpButton
          className="schedule_help-button"
          iconName={HelpReactSvgUrl}
          getContent={renderHelpContent}
          tooltipMaxWidth="310px"
          place="right"
          offsetRight={0}
        />
      </div>
      <div className="main_options">
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
          className="schedule-backup_combobox days_option"
          showDisabledItems
          directionY="both"
        />
        {weeklySchedule && (
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
            className="schedule-backup_combobox weekly_option"
            showDisabledItems
            directionY="both"
          />
        )}
        {monthlySchedule && (
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
            className="schedule-backup_combobox month_options"
            showDisabledItems
            directionY="both"
          />
        )}
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
          className="schedule-backup_combobox time_options"
          showDisabledItems
          directionY="both"
        />
      </div>
      <div className="maxCopiesOption">
        <ComboBox
          options={maxNumberCopiesArray}
          selectedOption={{
            key: 0,
            label: `${t("MaxCopies", {
              copiesCount: selectedMaxCopiesNumber,
            })}`,
          }}
          onSelect={setMaxCopies}
          isDisabled={isLoadingData}
          noBorder={false}
          scaled={false}
          scaledOptions
          dropDownMaxHeight={300}
          className="schedule-backup_combobox max_copies"
          showDisabledItems
          directionY="both"
        />
      </div>
    </StyledScheduleComponent>
  );
};

export default inject(({ backup }) => {
  const {
    selectedPeriodLabel,
    selectedWeekdayLabel,
    selectedHour,
    selectedMonthDay,
    selectedMaxCopiesNumber,
    setPeriod,
    setMonthNumber,
    setTime,
    setMaxCopies,
    setWeekday,
    selectedPeriodNumber,
  } = backup;

  const weeklySchedule = +selectedPeriodNumber === EveryWeekType;
  const monthlySchedule = +selectedPeriodNumber === EveryMonthType;

  return {
    selectedPeriodLabel,
    selectedWeekdayLabel,
    selectedHour,
    selectedMonthDay,
    selectedMaxCopiesNumber,
    setPeriod,
    setMonthNumber,
    setTime,
    setMaxCopies,
    setWeekday,

    weeklySchedule,
    monthlySchedule,
  };
})(observer(ScheduleComponent));
