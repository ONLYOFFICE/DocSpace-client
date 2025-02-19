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

"use client";

import React, { useEffect, useMemo } from "react";
import { ComboBox, type TOption } from "@docspace/shared/components/combobox";
import { ThirdPartyStorages } from "@docspace/shared/enums";
import { getOptions } from "@docspace/shared/utils/getThirdPartyStoragesOptions";

import { GoogleCloudStorage } from "../storages/GoogleCloudStorage";
import { RackspaceStorage } from "../storages/RackspaceStorage";
import { SelectelStorage } from "../storages/SelectelStorage";
import { AmazonStorage } from "../storages/AmazonStorage";

import { StyledAutoBackup } from "./ThirdPartyStorageModule.styled";
import type { ThirdPartyStorageModuleProps } from "./ThirdPartyStorageModule.types";

const ThirdPartyStorageModule = ({
  thirdPartyStorage,
  defaultStorageId,
  setStorageId,
  isLoadingData,
  setCompletedFormFields,
  isNeedFilePath,
  errorsFieldsBeforeSafe,
  formSettings,
  addValueInFormSettings,
  setRequiredFormSettings,
  setIsThirdStorageChanged,
  selectedPeriodLabel,
  selectedWeekdayLabel,

  selectedHour,
  selectedMaxCopiesNumber,
  selectedMonthDay,
  selectedPeriodNumber,
  setMaxCopies,
  setMonthNumber,
  setPeriod,
  setTime,
  setWeekday,
  hoursArray,
  maxNumberCopiesArray,
  monthNumbersArray,
  periodsObject,
  weekdaysLabelArray,

  storageRegions,
  defaultRegion,
  deleteValueFormSetting,
  selectedStorageId,
}: ThirdPartyStorageModuleProps) => {
  const {
    comboBoxOptions,
    storagesInfo,
    selectedStorageId: defaultSelectedStorageId,
  } = useMemo(() => getOptions(thirdPartyStorage), [thirdPartyStorage]);

  useEffect(() => {
    if (!defaultStorageId) setStorageId(defaultSelectedStorageId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (option: TOption) => {
    const key = option.key;
    const storage = storagesInfo[key];

    setStorageId(storage.id);
  };

  const commonProps = {
    selectedStorage:
      storagesInfo[selectedStorageId ?? defaultSelectedStorageId],
    selectedId: selectedStorageId,
    isLoadingData,
    setCompletedFormFields,
    isNeedFilePath,
    errorsFieldsBeforeSafe,
    formSettings,
    addValueInFormSettings,
    setRequiredFormSettings,
    setIsThirdStorageChanged,
    selectedPeriodLabel,
    selectedWeekdayLabel,
    selectedHour,
    selectedMonthDay,
    selectedMaxCopiesNumber,
    selectedPeriodNumber,

    setMaxCopies,
    setMonthNumber,
    setPeriod,
    setWeekday,
    setTime,

    periodsObject,
    weekdaysLabelArray,
    monthNumbersArray,
    hoursArray,
    maxNumberCopiesArray,
  };

  const storageTitle =
    storagesInfo[selectedStorageId ?? defaultSelectedStorageId]?.title;

  return (
    <StyledAutoBackup>
      <div className="auto-backup_storages-module">
        <ComboBox
          options={comboBoxOptions}
          selectedOption={{
            key: 0,
            label: storageTitle,
          }}
          onSelect={onSelect}
          isDisabled={isLoadingData}
          noBorder={false}
          scaled
          scaledOptions
          dropDownMaxHeight={300}
          className="backup_combo"
          showDisabledItems
        />

        {selectedStorageId === ThirdPartyStorages.GoogleId ? (
          <GoogleCloudStorage {...commonProps} />
        ) : null}

        {selectedStorageId === ThirdPartyStorages.RackspaceId ? (
          <RackspaceStorage {...commonProps} />
        ) : null}

        {selectedStorageId === ThirdPartyStorages.SelectelId ? (
          <SelectelStorage {...commonProps} />
        ) : null}

        {selectedStorageId === ThirdPartyStorages.AmazonId ? (
          <AmazonStorage
            storageRegions={storageRegions}
            defaultRegion={defaultRegion}
            deleteValueFormSetting={deleteValueFormSetting}
            {...commonProps}
          />
        ) : null}
      </div>
    </StyledAutoBackup>
  );
};

export default ThirdPartyStorageModule;

// export default inject(({ backup }) => {
//   const {
//     thirdPartyStorage,
//     setStorageId,
//     selectedStorageId,
//     defaultStorageId,
//   } = backup;

//   return {
//     thirdPartyStorage,
//     setStorageId,
//     selectedStorageId,
//     defaultStorageId,
//   };
// })(withTranslation("Settings")(observer(ThirdPartyStorageModule)));
