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

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { ThirdPartyStorages } from "@docspace/shared/enums";
import {
  AmazonSettings,
  formNames,
} from "@docspace/shared/components/amazon-settings";

import type { TTheme } from "@docspace/shared/themes";

import type {
  SelectedStorageType,
  StorageRegionsType,
  TTranslation,
} from "@docspace/shared/types";

interface AmazonStorageProps {
  t: TTranslation;
  theme: TTheme;
  isValidForm: boolean;
  buttonSize: ButtonSize;
  isMaxProgress: boolean;
  isLoadingData: boolean;
  isNeedFilePath: boolean;
  isLoading: boolean;
  selectedStorage?: SelectedStorageType;
  formSettings: Record<string, string>;
  errorsFieldsBeforeSafe: Record<string, boolean>;
  defaultRegion: unknown;
  storageRegions: StorageRegionsType[];

  deleteValueFormSetting: (key: string) => void;
  addValueInFormSettings: (name: string, value: string) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
  setRequiredFormSettings: (arr: string[]) => void;

  setCompletedFormFields: (
    values: Record<string, unknown>,
    module?: unknown,
  ) => void;
  onMakeCopyIntoStorage: () => Promise<void>;
}

const AmazonStorage = ({
  t,
  theme,
  isLoading,
  buttonSize,
  isValidForm,
  formSettings,
  isMaxProgress,
  defaultRegion,
  isLoadingData,
  storageRegions,
  isNeedFilePath,
  selectedStorage,
  errorsFieldsBeforeSafe,
  onMakeCopyIntoStorage,
  setCompletedFormFields,
  deleteValueFormSetting,
  addValueInFormSettings,
  setIsThirdStorageChanged,
  setRequiredFormSettings,
}: AmazonStorageProps) => {
  useEffect(() => {
    const basicValues = formNames(storageRegions[0].systemName);

    const moduleValues = JSON.parse(
      localStorage.getItem("LocalCopyThirdPartyStorageValues") ?? "null",
    );
    const moduleType =
      JSON.parse(localStorage.getItem("LocalCopyStorage") ?? "null") ===
      ThirdPartyStorages.AmazonId;

    setCompletedFormFields(
      moduleType && moduleValues ? moduleValues : basicValues,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDisabled = selectedStorage && !selectedStorage.isSet;

  return (
    <>
      <AmazonSettings
        t={t}
        theme={theme}
        isLoadingData={isLoadingData}
        selectedStorage={selectedStorage}
        isNeedFilePath={isNeedFilePath}
        formSettings={formSettings}
        isLoading={isLoading}
        defaultRegion={defaultRegion}
        storageRegions={storageRegions}
        errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
        deleteValueFormSetting={deleteValueFormSetting}
        addValueInFormSettings={addValueInFormSettings}
        setIsThirdStorageChanged={setIsThirdStorageChanged}
        setRequiredFormSettings={setRequiredFormSettings}
      />
      <div className="manual-backup_buttons">
        <Button
          id="create-copy"
          label={t("Common:CreateCopy")}
          onClick={onMakeCopyIntoStorage}
          primary
          isDisabled={!isValidForm || !isMaxProgress || isDisabled}
          size={buttonSize}
        />
      </div>
    </>
  );
};

export default AmazonStorage;

// export default inject(({ backup }) => {
//   const { setCompletedFormFields, storageRegions, isValidForm } = backup;

//   return {
//     setCompletedFormFields,
//     storageRegions,
//     isValidForm,
//   };
// })(observer(withTranslation(["Settings", "Common"])(AmazonStorage)));
