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

import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from "react";
import classNames from "classnames";

import type {
  BackupToPublicRoomOptionType,
  Nullable,
} from "../../../../../types";
import { BackupStorageType } from "../../../../../enums";
import { FilesSelectorInput } from "../../../../../components/files-selector-input";
import BackupToPublicRoom from "../../../../../dialogs/backup-to-public-room-dialog";
import { useDidMount } from "../../../../../hooks/useDidMount";

import { ScheduleComponent } from "../ScheduleComponent";
import styles from "../../AutoBackup.module.scss";
import {
  RoomsModuleProps,
  BackupToPublicRoomDialogState,
} from "./RoomsModule.types";
import NoteComponent from "../../../sub-components/NoteComponent";

const defaultState: BackupToPublicRoomDialogState = {
  visible: false,
  data: null,
};

const RoomsModule = ({
  isError,
  setIsError,
  setSelectedFolder,
  defaultStorageType,
  defaultFolderId,
  isLoadingData,
  setBasePath,
  setNewPath,
  settingsFileSelector,
  toDefault,
  basePath,
  isErrorPath,
  newPath,
  currentDeviceType,

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
  weekdaysLabelArray,
  setMaxCopies,
  setMonthNumber,
  setPeriod,
  setTime,
  setWeekday,
  isBackupPaid,
  isFreeBackupsLimitReached,
}: RoomsModuleProps) => {
  const { t } = useTranslation("Common");

  const [backupToPublicRoomDialog, setBackupToPublicRoom] = useState<{
    visible: boolean;
    data: Nullable<BackupToPublicRoomOptionType>;
  }>(defaultState);

  const setBackupToPublicRoomVisible = (
    visible: boolean,
    data: Nullable<BackupToPublicRoomOptionType> = null,
  ) => {
    setBackupToPublicRoom({
      visible,
      data,
    });
  };

  const isDocumentsDefault =
    defaultStorageType === BackupStorageType.DocumentModuleType.toString();

  const passedId = isDocumentsDefault ? defaultFolderId : "";

  useDidMount(() => {
    if (isDocumentsDefault && defaultFolderId) {
      setSelectedFolder(defaultFolderId);
    } else setSelectedFolder("");
  });

  const onSelectFolder = (id: string | number | undefined) => {
    setSelectedFolder(`${id}`);
    setIsError(false);
  };

  const formProps = useMemo(
    () => ({
      isRoomFormAccessible: false,
      message: t("Common:BackupNotAllowedInFormRoom"),
    }),
    [t],
  );

  return (
    <div data-testid="rooms-module">
      <div
        className={classNames(
          styles.autoBackupFolderInput,
          "auto-backup_folder-input",
        )}
      >
        <FilesSelectorInput
          withCreate
          isRoomBackup
          isSelectFolder
          newPath={newPath}
          isError={isError}
          basePath={basePath}
          isErrorPath={isErrorPath}
          isDisabled={isLoadingData}
          formProps={formProps}
          withoutInitPath={!isDocumentsDefault}
          currentDeviceType={currentDeviceType}
          filesSelectorSettings={settingsFileSelector}
          toDefault={toDefault}
          setNewPath={setNewPath}
          setBasePath={setBasePath}
          onSelectFolder={onSelectFolder}
          setBackupToPublicRoomVisible={setBackupToPublicRoomVisible}
          {...(passedId ? { id: passedId } : { openRoot: true })}
        />
      </div>
      {backupToPublicRoomDialog.visible && backupToPublicRoomDialog.data ? (
        <BackupToPublicRoom
          key="backup-to-public-room-panel"
          visible={backupToPublicRoomDialog.visible}
          backupToPublicRoomData={backupToPublicRoomDialog.data}
          setIsVisible={setBackupToPublicRoomVisible}
        />
      ) : null}

      <ScheduleComponent
        hoursArray={hoursArray}
        selectedHour={selectedHour}
        isLoadingData={isLoadingData}
        periodsObject={periodsObject}
        selectedMonthDay={selectedMonthDay}
        monthNumbersArray={monthNumbersArray}
        weekdaysLabelArray={weekdaysLabelArray}
        selectedPeriodLabel={selectedPeriodLabel}
        maxNumberCopiesArray={maxNumberCopiesArray}
        selectedPeriodNumber={selectedPeriodNumber}
        selectedWeekdayLabel={selectedWeekdayLabel}
        selectedMaxCopiesNumber={selectedMaxCopiesNumber}
        setTime={setTime}
        setPeriod={setPeriod}
        setWeekday={setWeekday}
        setMaxCopies={setMaxCopies}
        setMonthNumber={setMonthNumber}
      />
      <NoteComponent
        isVisible={Boolean(isBackupPaid && isFreeBackupsLimitReached)}
      />
    </div>
  );
};

export default RoomsModule;
