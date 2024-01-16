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
