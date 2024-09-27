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
  SelectelSettings,
  formNames,
} from "@docspace/shared/components/selectel-settings";
import type { SelectedStorageType, TTranslation } from "@docspace/shared/types";

interface SelectelStorageProps {
  t: TTranslation;
  isLoading?: boolean;
  isValidForm: boolean;
  buttonSize?: ButtonSize;
  isMaxProgress: boolean;
  isLoadingData: boolean;
  isNeedFilePath: boolean;
  selectedStorage?: SelectedStorageType;
  formSettings: Record<string, string>;
  errorsFieldsBeforeSafe: Record<string, boolean>;
  onMakeCopyIntoStorage: () => Promise<void>;
  setRequiredFormSettings: (arr: string[]) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
  addValueInFormSettings: (name: string, value: string) => void;
  setCompletedFormFields: (
    values: Record<string, unknown>,
    module?: unknown,
  ) => void;
}

const SelectelStorage = ({
  isLoading,
  buttonSize,
  isValidForm,
  formSettings,
  isLoadingData,
  isMaxProgress,
  isNeedFilePath,
  selectedStorage,
  errorsFieldsBeforeSafe,
  t,
  onMakeCopyIntoStorage,
  setCompletedFormFields,
  addValueInFormSettings,
  setRequiredFormSettings,
  setIsThirdStorageChanged,
}: SelectelStorageProps) => {
  const isDisabled = selectedStorage && !selectedStorage.isSet;

  useEffect(() => {
    const basicValues = formNames();

    const moduleValues = JSON.parse(
      localStorage.getItem("LocalCopyThirdPartyStorageValues") ?? "null",
    );

    const moduleType =
      JSON.parse(localStorage.getItem("LocalCopyStorage") ?? "null") ===
      ThirdPartyStorages.SelectelId;

    setCompletedFormFields(
      moduleType && moduleValues ? moduleValues : basicValues,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SelectelSettings
        t={t}
        isLoading={isLoading}
        formSettings={formSettings}
        isLoadingData={isLoadingData}
        isNeedFilePath={isNeedFilePath}
        selectedStorage={selectedStorage}
        errorsFieldsBeforeSafe={errorsFieldsBeforeSafe}
        addValueInFormSettings={addValueInFormSettings}
        setRequiredFormSettings={setRequiredFormSettings}
        setIsThirdStorageChanged={setIsThirdStorageChanged}
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

export default SelectelStorage;

// export default inject(({ backup }) => {
//   const { setCompletedFormFields, isValidForm } = backup;

//   return {
//     isValidForm,
//     setCompletedFormFields,
//   };
// })(observer(withTranslation(["Settings", "Common"])(SelectelStorage)));
