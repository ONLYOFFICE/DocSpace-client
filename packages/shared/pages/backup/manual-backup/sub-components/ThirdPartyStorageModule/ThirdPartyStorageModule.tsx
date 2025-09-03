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

import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from "react";
import classNames from "classnames";

import LockedReactSvg from "PUBLIC_DIR/images/icons/16/locked.react.svg";

import { Text } from "../../../../../components/text";
import { ComboBox } from "../../../../../components/combobox";
import { DropDownItem } from "../../../../../components/drop-down-item";
import { BackupStorageType, ThirdPartyStorages } from "../../../../../enums";
import { getOptions } from "../../../../../utils/getThirdPartyStoragesOptions";
import { getFromLocalStorage } from "../../../../../utils";
import { IconButton } from "../../../../../components/icon-button";
import { toastr } from "../../../../../components/toast";
import { THIRD_PARTY_SERVICES_URL } from "../../../../../constants";
import type { ButtonSize } from "../../../../../components/button";
import type {
  SelectedStorageType,
  StorageRegionsType,
} from "../../../../../types";

import { GoogleCloudStorage } from "../storages/GoogleCloudStorage";
import { RackspaceStorage } from "../storages/RackspaceStorage";
import { SelectelStorage } from "../storages/SelectelStorage";
import { AmazonStorage } from "../storages/AmazonStorage";

import styles from "../../ManualBackup.module.scss";

const DefaultParameters = {
  comboBoxOptions: [],
  storagesInfo: {},
  selectedStorageTitle: "",
  selectedStorageId: "",
};

interface ThirdPartyStorageModuleProps {
  isValidForm: boolean;
  isNeedFilePath: boolean;
  isMaxProgress: boolean;
  buttonSize?: ButtonSize;
  thirdPartyStorage: SelectedStorageType[];
  formSettings: Record<string, string>;
  errorsFieldsBeforeSafe: Record<string, boolean>;
  defaultRegion: string;
  storageRegions: StorageRegionsType[];
  isFormReady: () => boolean;
  onMakeCopy: (
    selectedFolder: string | number,
    moduleName: string,
    moduleType: string,
    selectedStorageId?: string,
    selectedStorageTitle?: string,
  ) => Promise<void>;
  deleteValueFormSetting: (key: string) => void;
  setCompletedFormFields: (
    values: Record<string, string>,
    module?: string,
  ) => void;
  addValueInFormSettings: (name: string, value: string) => void;
  setRequiredFormSettings: (arr: string[]) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
  isThirdPartyAvailable: boolean;
}

const ThirdPartyStorageModule = ({
  buttonSize,
  isValidForm,
  formSettings,
  storageRegions,
  isMaxProgress,
  defaultRegion,
  isNeedFilePath,
  thirdPartyStorage,
  errorsFieldsBeforeSafe,
  isFormReady,
  onMakeCopy,
  setCompletedFormFields,
  addValueInFormSettings,
  deleteValueFormSetting,
  setRequiredFormSettings,
  setIsThirdStorageChanged,
  isThirdPartyAvailable,
}: ThirdPartyStorageModuleProps) => {
  const { t } = useTranslation(["Common"]);

  const { comboBoxOptions, storagesInfo, ...parameters } =
    useMemo((): NonNullable<ReturnType<typeof getOptions>> => {
      if (thirdPartyStorage && thirdPartyStorage.length > 0) {
        return getOptions(thirdPartyStorage) ?? DefaultParameters;
      }

      return DefaultParameters;
    }, [thirdPartyStorage]);

  const [selectedStorageTitle, setSelectedStorageTitle] = useState<string>(
    () => {
      const storageTitle = getFromLocalStorage<string>(
        "LocalCopyThirdPartyStorageType",
      );

      return storageTitle ?? parameters.selectedStorageTitle;
    },
  );

  const [selectedId, setSelectedId] = useState<string>(() => {
    const storageId = getFromLocalStorage<string>("LocalCopyStorage");
    return storageId ?? parameters.selectedStorageId;
  });

  const [isStartCopy, setIsStartCopy] = useState(false);

  const onSelect = (key: string) => {
    const selectedStorage = storagesInfo[key];

    if (!selectedStorage.isSet) {
      return window.open(`${THIRD_PARTY_SERVICES_URL}${key}`, "_blank");
    }

    setSelectedId(selectedStorage.id);
    setSelectedStorageTitle(selectedStorage.title);
  };

  const onMakeCopyIntoStorage = async () => {
    if (!isFormReady()) return;

    try {
      setIsStartCopy(true);
      await onMakeCopy(
        "",
        "ThirdPartyStorage",
        `${BackupStorageType.StorageModuleType}`,
        selectedId,
        selectedStorageTitle,
      );

      setIsStartCopy(false);
    } catch (error) {
      console.error(error);
      toastr.error(error as Error);
    }
  };

  const commonProps = {
    isLoadingData: !isMaxProgress || isStartCopy,
    selectedStorage: storagesInfo[selectedId],
    isMaxProgress,
    selectedId,
    buttonSize,
    onMakeCopyIntoStorage,
    t,
    isValidForm,
    isNeedFilePath,
    formSettings,
    errorsFieldsBeforeSafe,
    setCompletedFormFields,
    addValueInFormSettings,
    setRequiredFormSettings,
    setIsThirdStorageChanged,
    isThirdPartyAvailable,
  };

  const advancedOptions = (
    <div style={{ display: "contents" }}>
      {comboBoxOptions?.map((item) => {
        return (
          <div
            className={classNames(styles.comboboxItem, {
              [styles.isDisabled]: item.disabled,
            })}
            key={item.key}
          >
            <DropDownItem
              onClick={() => onSelect(item.key)}
              data-third-party-key={item.key}
              disabled={item.disabled}
              isActive={selectedId === item.key}
              testId={`${item.key}_dropdown_item`}
            >
              <Text
                className={classNames(
                  styles.dropDownItemText,
                  "drop-down-item_text",
                )}
                fontWeight={600}
              >
                {item.label}
              </Text>

              {!item.disabled && !item.connected ? (
                <IconButton
                  isFill
                  size={16}
                  className={classNames(
                    styles.dropDownItemIcon,
                    "drop-down-item_icon",
                  )}
                  onClick={() => onSelect(item.key)}
                  iconName={ExternalLinkReactSvgUrl}
                  dataTestId={`${item.key}_dropdown_item_icon`}
                />
              ) : null}
            </DropDownItem>
          </div>
        );
      })}
    </div>
  );

  return (
    <div data-testid="third-party-storage-module">
      <div
        className={classNames(
          styles.manualBackupStoragesModule,
          "manual-backup_storages-module",
        )}
      >
        {!isThirdPartyAvailable ? (
          <div
            className={styles.notAvailable}
            data-testid="third-party-storage-not-available"
          >
            <LockedReactSvg />
            <Text>{t("Common:NotIncludedInYourCurrentPlan")}</Text>
          </div>
        ) : null}

        <ComboBox
          options={[]}
          displayArrow
          isDefaultMode
          scaledOptions
          noBorder={false}
          showDisabledItems
          directionY="both"
          manualWidth="400px"
          displaySelectedOption
          hideMobileView={false}
          forceCloseClickOutside
          className={classNames(styles.backupCombo, "backup_combo")}
          advancedOptions={advancedOptions}
          selectedOption={{ key: 0, label: selectedStorageTitle }}
          isDisabled={!isMaxProgress || isStartCopy || !thirdPartyStorage}
          dataTestId="backup_storage_combobox"
          dropDownTestId="backup_storage_dropdown"
        />

        {selectedId === ThirdPartyStorages.GoogleId ? (
          <GoogleCloudStorage {...commonProps} />
        ) : null}

        {selectedId === ThirdPartyStorages.RackspaceId ? (
          <RackspaceStorage {...commonProps} />
        ) : null}

        {selectedId === ThirdPartyStorages.SelectelId ? (
          <SelectelStorage {...commonProps} />
        ) : null}

        {selectedId === ThirdPartyStorages.AmazonId ? (
          <AmazonStorage
            defaultRegion={defaultRegion}
            storageRegions={storageRegions}
            deleteValueFormSetting={deleteValueFormSetting}
            {...commonProps}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ThirdPartyStorageModule;
