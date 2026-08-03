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
import { useTranslation } from "react-i18next";

import {
  AmazonSettings,
  formNames,
} from "../../../../../../components/amazon-settings";
import { useDidMount } from "../../../../../../hooks/useDidMount";

import { ScheduleComponent } from "../../ScheduleComponent";

import type { AmazonStorageProps } from "./AmazonStorage.types";

const AmazonStorage = ({
  isLoading,
  formSettings,
  defaultRegion,
  isLoadingData,
  storageRegions,
  isNeedFilePath,
  selectedStorage,
  errorsFieldsBeforeSafe,
  setCompletedFormFields,
  addValueInFormSettings,
  deleteValueFormSetting,
  setRequiredFormSettings,
  setIsThirdStorageChanged,
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
  weekdaysLabelArray,
  setMaxCopies,
  setMonthNumber,
  setPeriod,
  setTime,
  setWeekday,
}: AmazonStorageProps) => {
  const { t } = useTranslation(["Common"]);

  useDidMount(() => {
    setCompletedFormFields(formNames(storageRegions[0].systemName), "s3");
  });

  return (
    <div data-testid="amazon-storage">
      <AmazonSettings
        t={t}
        isLoading={isLoading}
        isLoadingData={isLoadingData}
        selectedStorage={selectedStorage}
        isNeedFilePath={isNeedFilePath}
        formSettings={formSettings}
        defaultRegion={defaultRegion}
        errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
        storageRegions={storageRegions}
        deleteValueFormSetting={deleteValueFormSetting}
        addValueInFormSettings={addValueInFormSettings}
        setIsThirdStorageChanged={setIsThirdStorageChanged}
        setRequiredFormSettings={setRequiredFormSettings}
      />
      <ScheduleComponent
        setTime={setTime}
        setPeriod={setPeriod}
        setWeekday={setWeekday}
        setMaxCopies={setMaxCopies}
        setMonthNumber={setMonthNumber}
        hoursArray={hoursArray}
        selectedHour={selectedHour}
        periodsObject={periodsObject}
        isLoadingData={isLoadingData}
        selectedMonthDay={selectedMonthDay}
        monthNumbersArray={monthNumbersArray}
        weekdaysLabelArray={weekdaysLabelArray}
        selectedPeriodLabel={selectedPeriodLabel}
        selectedWeekdayLabel={selectedWeekdayLabel}
        selectedPeriodNumber={selectedPeriodNumber}
        maxNumberCopiesArray={maxNumberCopiesArray}
        selectedMaxCopiesNumber={selectedMaxCopiesNumber}
      />
    </div>
  );
};

export default AmazonStorage;
