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

import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import { ReactSVG } from "react-svg";
import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from "react";

import { Text } from "@docspace/shared/components/text";
import {
  ComboBox,
  ComboBoxSize,
  type TOption,
} from "@docspace/shared/components/combobox";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { BackupStorageType, ThirdPartyStorages } from "@docspace/shared/enums";
import { getOptions } from "@docspace/shared/utils/getThirdPartyStoragesOptions";
import { getFromLocalStorage } from "@docspace/shared/utils/getFromLocalStorage";
import { ButtonSize } from "@docspace/shared/components/button";

import type {
  SelectedStorageType,
  StorageRegionsType,
} from "@docspace/shared/types";

import { StyledManualBackup, StyledComboBoxItem } from "../ManualBackup.styled";

import GoogleCloudStorage from "./storages/GoogleCloudStorage";
import RackspaceStorage from "./storages/RackspaceStorage";
import SelectelStorage from "./storages/SelectelStorage";
import AmazonStorage from "./storages/AmazonStorage";

const DefaultParameters = {
  comboBoxOptions: [],
  storagesInfo: {},
  selectedStorageTitle: "",
  selectedStorageId: "",
};

type SelectType =
  | TOption
  | React.MouseEvent<HTMLElement>
  | React.ChangeEvent<HTMLInputElement>;

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
    values: Record<string, unknown>,
    module?: unknown,
  ) => void;
  addValueInFormSettings: (name: string, value: string) => void;
  setRequiredFormSettings: (arr: string[]) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
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
}: ThirdPartyStorageModuleProps) => {
  const { t } = useTranslation(["Settings", "Common"]);

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

  const onSelect = (event: SelectType) => {
    if (!("currentTarget" in event)) return;

    const data = event.currentTarget.dataset;

    const selectedStorageId = data.thirdPartyKey ?? "";

    const selectedStorage = storagesInfo[selectedStorageId];

    if (!selectedStorage.isSet) {
      return window.open(
        `/portal-settings/integration/third-party-services?service=${data.thirdPartyKey}`,
        "_blank",
      );
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
      // eslint-disable-next-line no-console
      console.error(error);
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
  };

  const advancedOptions = comboBoxOptions?.map((item) => {
    return (
      <StyledComboBoxItem isDisabled={item.disabled} key={item.key}>
        <DropDownItem
          onClick={onSelect}
          // className={item.className}
          data-third-party-key={item.key}
          disabled={item.disabled}
        >
          <Text className="drop-down-item_text" fontWeight={600}>
            {item.label}
          </Text>

          {!item.disabled && !item.connected ? (
            <ReactSVG
              src={ExternalLinkReactSvgUrl}
              className="drop-down-item_icon"
            />
          ) : null}
        </DropDownItem>
      </StyledComboBoxItem>
    );
  });

  return (
    <StyledManualBackup>
      <div className="manual-backup_storages-module">
        <ComboBox
          options={[]}
          displayArrow
          isDefaultMode
          scaledOptions
          noBorder={false}
          showDisabledItems
          directionY="both"
          manualWidth="400px"
          onSelect={onSelect}
          displaySelectedOption
          hideMobileView={false}
          forceCloseClickOutside
          className="backup_combo"
          size={ComboBoxSize.content}
          advancedOptions={advancedOptions}
          selectedOption={{ key: 0, label: selectedStorageTitle }}
          isDisabled={!isMaxProgress || isStartCopy || !thirdPartyStorage}
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
    </StyledManualBackup>
  );
};

export default ThirdPartyStorageModule;

// export default inject(({ backup }) => {
//   const { thirdPartyStorage, isFormReady } = backup;

//   return {
//     thirdPartyStorage,
//     isFormReady,
//   };
// })(observer(ThirdPartyStorageModule));
