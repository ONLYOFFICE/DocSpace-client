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

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  RackspaceSettings,
  formNames,
} from "@docspace/shared/components/rackspace-settings";

import { ScheduleComponent } from "../../ScheduleComponent";

import { StyledStoragesModule } from "./RackspaceStorage.styled";
import type { RackspaceStorageProps } from "./RackspaceStorage.types";

const RackspaceStorage = ({
  isLoading,
  formSettings,
  isLoadingData,
  isNeedFilePath,
  selectedStorage,
  errorsFieldsBeforeSafe,
  addValueInFormSettings,
  setIsThirdStorageChanged,
  setRequiredFormSettings,
  setCompletedFormFields,
  // ScheduleComponent
  hoursArray,
  maxNumberCopiesArray,
  monthNumbersArray,
  periodsObject,
  selectedHour,
  selectedMaxCopiesNumber,
  selectedMonthDay,
  selectedPeriodLabel,
  selectedPeriodNumber,
  selectedWeekdayLabel,
  setMaxCopies,
  setMonthNumber,
  setPeriod,
  setTime,
  setWeekday,
  weekdaysLabelArray,
}: RackspaceStorageProps) => {
  const { t } = useTranslation(["Settings", "Common"]);

  useEffect(() => {
    setCompletedFormFields(formNames(), "rackspace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledStoragesModule>
      <RackspaceSettings
        t={t}
        isLoading={isLoading}
        formSettings={formSettings}
        isLoadingData={isLoadingData}
        selectedStorage={selectedStorage}
        isNeedFilePath={isNeedFilePath}
        errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
        addValueInFormSettings={addValueInFormSettings}
        setRequiredFormSettings={setRequiredFormSettings}
        setIsThirdStorageChanged={setIsThirdStorageChanged}
      />

      <ScheduleComponent
        isLoadingData={isLoadingData}
        selectedPeriodLabel={selectedPeriodLabel}
        selectedWeekdayLabel={selectedWeekdayLabel}
        selectedHour={selectedHour}
        selectedMonthDay={selectedMonthDay}
        selectedMaxCopiesNumber={selectedMaxCopiesNumber}
        selectedPeriodNumber={selectedPeriodNumber}
        setMaxCopies={setMaxCopies}
        setPeriod={setPeriod}
        setWeekday={setWeekday}
        setMonthNumber={setMonthNumber}
        setTime={setTime}
        periodsObject={periodsObject}
        weekdaysLabelArray={weekdaysLabelArray}
        monthNumbersArray={monthNumbersArray}
        hoursArray={hoursArray}
        maxNumberCopiesArray={maxNumberCopiesArray}
      />
    </StyledStoragesModule>
  );
};

export default RackspaceStorage;

// export default inject(({ backup }) => {
//   const { setCompletedFormFields } = backup;

//   return {
//     setCompletedFormFields,
//   };
// })(observer(withTranslation(["Settings", "Common"])(RackspaceStorage)));
