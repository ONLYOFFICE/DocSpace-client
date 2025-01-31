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

import React, { useMemo, useState } from "react";
import { ReactSVG } from "react-svg";

import { Text } from "@docspace/shared/components/text";
import { ThirdPartyStorages } from "@docspace/shared/enums";
import {
  ComboBox,
  ComboBoxSize,
  TOption,
} from "@docspace/shared/components/combobox";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import {
  getOptions,
  type ReturnOptions,
} from "@docspace/shared/utils/getThirdPartyStoragesOptions";

import type {
  SelectedStorageType,
  StorageRegionsType,
} from "@docspace/shared/types";

import { GoogleCloudStorage } from "./storages/GoogleCloudStorage";
import { AmazonStorage } from "./storages/AmazonStorage";
import { RackspaceStorage } from "./storages/RackspaceStorage";
import { SelectelStorage } from "./storages/SelectelStorage";

import { StyledComboBoxItem } from "../RestoreBackup.styled";

const DefaultState = {
  comboBoxOptions: [],
  storagesInfo: {},
  selectedStorageTitle: "",
  selectedStorageId: "",
};

export interface ThirdPartyStoragesModuleProps {
  defaultRegion: string;
  isLoadingData?: boolean;
  storageRegions: StorageRegionsType[];
  thirdPartyStorage: SelectedStorageType[];
  onSetStorageId: (id: string) => void;

  setCompletedFormFields: (
    values: Record<string, unknown>,
    module?: unknown,
  ) => void;
  errorsFieldsBeforeSafe: Record<string, boolean>;
  formSettings: Record<string, string>;

  addValueInFormSettings: (name: string, value: string) => void;
  setRequiredFormSettings: (arr: string[]) => void;
  deleteValueFormSetting: (key: string) => void;
  setIsThirdStorageChanged: (changed: boolean) => void;
}

const ThirdPartyStoragesModule = ({
  thirdPartyStorage,
  onSetStorageId,
  setCompletedFormFields,
  errorsFieldsBeforeSafe,
  formSettings,
  isLoadingData = false,
  addValueInFormSettings,
  setRequiredFormSettings,
  setIsThirdStorageChanged,
  defaultRegion,
  deleteValueFormSetting,
  storageRegions,
}: ThirdPartyStoragesModuleProps) => {
  const thirdPartyOptions = useMemo<ReturnOptions>(() => {
    if (!thirdPartyStorage) return DefaultState;

    return getOptions(thirdPartyStorage);
  }, [thirdPartyStorage]);

  const [selectedStorageTitle, setSelectedStorageTitle] = useState(
    thirdPartyOptions.selectedStorageTitle,
  );
  const [selectedStorageId, setSelectedStorageId] = useState(
    thirdPartyOptions.selectedStorageId,
  );

  const onSelect = (
    event:
      | TOption
      | React.MouseEvent<HTMLElement>
      | React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!("currentTarget" in event)) return;

    const data = event.currentTarget.dataset;

    const { storagesInfo } = thirdPartyOptions;

    const storageId = data.thirdPartyKey;

    if (!storageId) return;

    const storage = storagesInfo[storageId];
    const selectedStorage = storagesInfo[storageId];

    if (!selectedStorage.isSet) {
      return window.open(
        `/portal-settings/integration/third-party-services?service=${data.thirdPartyKey}`,
        "_blank",
      );
    }

    onSetStorageId?.(storage.id);
    setSelectedStorageId(storage.id);
    setSelectedStorageTitle(storage.title);
  };

  const commonProps = {
    selectedStorage: thirdPartyOptions.storagesInfo[selectedStorageId],
    setCompletedFormFields,
    errorsFieldsBeforeSafe,
    formSettings,
    isLoadingData,
    addValueInFormSettings,
    setRequiredFormSettings,
    setIsThirdStorageChanged,
  };

  const advancedOptions = thirdPartyOptions.comboBoxOptions?.map((item) => {
    return (
      <StyledComboBoxItem isDisabled={item.disabled} key={item.key}>
        <DropDownItem
          onClick={onSelect}
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
    <>
      <ComboBox
        options={[]}
        advancedOptions={advancedOptions}
        selectedOption={{ key: 0, label: selectedStorageTitle }}
        onSelect={onSelect}
        isDisabled={!thirdPartyStorage}
        size={ComboBoxSize.content}
        manualWidth="400px"
        directionY="both"
        displaySelectedOption
        noBorder={false}
        isDefaultMode
        hideMobileView={false}
        forceCloseClickOutside
        scaledOptions
        showDisabledItems
        displayArrow
        className="backup_combo"
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
          defaultRegion={defaultRegion}
          storageRegions={storageRegions}
          deleteValueFormSetting={deleteValueFormSetting}
          {...commonProps}
        />
      ) : null}
    </>
  );
};

export default ThirdPartyStoragesModule;

// export default inject(({ backup }) => {
//   const { thirdPartyStorage } = backup;
//   return {
//     thirdPartyStorage,
//   };
// })(observer(ThirdPartyStoragesModule));
