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
import classNames from "classnames";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  BackupStorageLocalKey,
  ThirdPartyStorages,
} from "../../../../../../enums";
import { useDidMount } from "../../../../../../hooks/useDidMount";
import { getFromLocalStorage } from "../../../../../../utils";

import {
  RackspaceSettings,
  formNames,
} from "../../../../../../components/rackspace-settings";
import type {
  SelectedStorageType,
  TTranslation,
} from "../../../../../../types";

import styles from "../../../ManualBackup.module.scss";

interface RackspaceStorageProps {
  t: TTranslation;
  isLoading?: boolean;
  isValidForm: boolean;
  isLoadingData: boolean;
  isMaxProgress: boolean;
  buttonSize?: ButtonSize;
  isNeedFilePath: boolean;
  formSettings: Record<string, string>;
  selectedStorage?: SelectedStorageType;
  errorsFieldsBeforeSafe: Record<string, boolean>;
  addValueInFormSettings: (name: string, value: string) => void;
  setRequiredFormSettings: (arr: string[]) => void;
  onMakeCopyIntoStorage: () => Promise<void>;
  setIsThirdStorageChanged: (changed: boolean) => void;
  setCompletedFormFields: (
    values: Record<string, string>,
    module?: string,
  ) => void;
  isThirdPartyAvailable: boolean;
}

const RackspaceStorage = ({
  isLoading,
  buttonSize,
  isValidForm,
  formSettings,
  isLoadingData,
  isMaxProgress,
  isNeedFilePath,
  selectedStorage,
  errorsFieldsBeforeSafe,

  addValueInFormSettings,
  setIsThirdStorageChanged,
  setRequiredFormSettings,
  setCompletedFormFields,
  onMakeCopyIntoStorage,
  t,
  isThirdPartyAvailable,
}: RackspaceStorageProps) => {
  const isDisabled = selectedStorage && !selectedStorage.isSet;

  useDidMount(() => {
    const basicValues = formNames();

    const moduleValues = getFromLocalStorage<Record<string, string>>(
      BackupStorageLocalKey.ThirdPartyStorageValues,
    );

    const moduleType =
      getFromLocalStorage<ThirdPartyStorages>(BackupStorageLocalKey.Storage) ===
      ThirdPartyStorages.RackspaceId;

    setCompletedFormFields(
      moduleType && moduleValues ? moduleValues : basicValues,
    );
  });

  return (
    <div data-testid="rackspace-storage">
      {isThirdPartyAvailable ? (
        <RackspaceSettings
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
      ) : null}
      <div
        className={classNames(
          styles.manualBackupButtons,
          "manual-backup_buttons",
        )}
      >
        <Button
          id="create-copy"
          label={t("Common:CreateCopy")}
          onClick={onMakeCopyIntoStorage}
          primary
          isDisabled={!isValidForm || !isMaxProgress || isDisabled}
          size={buttonSize}
          testId="racspace_create_copy_button"
        />
      </div>
    </div>
  );
};

export default RackspaceStorage;
