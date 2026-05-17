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

"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";

import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import { ComboBox } from "@docspace/ui-kit/components/combobox";
import { ThirdPartyStorages } from "../../../../../enums";
import { getOptions } from "../../../../../utils/getThirdPartyStoragesOptions";
import { useDidMount } from "../../../../../hooks/useDidMount";
import { useUnmount } from "@docspace/ui-kit/hooks/useUnmount";
import { DropDownItem } from "../../../../../components/drop-down-item";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Text } from "@docspace/ui-kit/components/text";
import { THIRD_PARTY_SERVICES_URL } from "../../../../../constants";

import { GoogleCloudStorage } from "../storages/GoogleCloudStorage";
import { RackspaceStorage } from "../storages/RackspaceStorage";
import { SelectelStorage } from "../storages/SelectelStorage";
import { AmazonStorage } from "../storages/AmazonStorage";

import styles from "../../AutoBackup.module.scss";
import type { ThirdPartyStorageModuleProps } from "./ThirdPartyStorageModule.types";
import NoteComponent from "../../../sub-components/NoteComponent";

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
  isBackupPaid,
  isFreeBackupsLimitReached,
}: ThirdPartyStorageModuleProps) => {
  const {
    comboBoxOptions,
    storagesInfo,
    selectedStorageId: defaultSelectedStorageId,
  } = useMemo(() => getOptions(thirdPartyStorage), [thirdPartyStorage]);

  useDidMount(() => {
    if (!defaultStorageId) setStorageId(defaultSelectedStorageId);
  });

  useUnmount(() => {
    if (!defaultStorageId) setStorageId(null);
  });

  const onSelect = useCallback(
    (key: string) => {
      const storage = storagesInfo[key];

      if (!storage.isSet) {
        return window.open(`${THIRD_PARTY_SERVICES_URL}${key}`, "_blank");
      }

      setStorageId(storage.id);
    },
    [storagesInfo, setStorageId],
  );

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

  const advancedOptions = useMemo(
    () => (
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
                disabled={item.disabled}
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
                    className={classNames(
                      styles.dropDownItemIcon,
                      "drop-down-item_icon",
                    )}
                    size={16}
                    onClick={() => onSelect(item.key)}
                    iconName={ExternalLinkReactSvgUrl}
                    isFill
                  />
                ) : null}
              </DropDownItem>
            </div>
          );
        })}
      </div>
    ),
    [comboBoxOptions, onSelect],
  );

  return (
    <>
      <div
        className={classNames(
          styles.autoBackupStoragesModule,
          "auto-backup_storages-module",
        )}
      >
        <ComboBox
          options={[]}
          advancedOptions={advancedOptions}
          selectedOption={{
            key: 0,
            label: storageTitle,
          }}
          isDisabled={isLoadingData}
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
          className={classNames(styles.backupCombo, "backup_combo")}
          dataTestId="auto_backup_storage_combobox"
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
      <NoteComponent
        isVisible={Boolean(isBackupPaid && isFreeBackupsLimitReached)}
      />
    </>
  );
};

export default ThirdPartyStorageModule;
