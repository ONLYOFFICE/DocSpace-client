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

import { useTranslation } from "react-i18next";
import React, { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";

import { Button, ButtonSize } from "../../../../../components/button";
import { getFromLocalStorage } from "../../../../../utils";
import { BackupStorageType, DeviceType } from "../../../../../enums";
import { FilesSelectorInput } from "../../../../../components/files-selector-input";
import { isNullOrUndefined } from "../../../../../utils/typeGuards";
import BackupToPublicRoom from "../../../../../dialogs/backup-to-public-room-dialog";
import { toastr } from "../../../../../components/toast";

import type { TBreadCrumb } from "../../../../../components/selector/Selector.types";
import type { FilesSelectorSettings } from "../../../../../components/files-selector-input";
import type {
  BackupToPublicRoomOptionType,
  Nullable,
} from "../../../../../types";

import styles from "../../ManualBackup.module.scss";
import NoteComponent from "../../../sub-components/NoteComponent";

const Documents = "Documents";

export interface RoomsModuleProps {
  onMakeCopy: (
    selectedFolder: string | number,
    moduleName: string,
    moduleType: string,
    selectedStorageId?: string,
    selectedStorageTitle?: string,
  ) => Promise<void>;
  buttonSize?: ButtonSize;
  maxWidth?: string;
  isMaxProgress: boolean;

  newPath: string;
  basePath: string;
  isErrorPath: boolean;
  currentDeviceType?: DeviceType;

  isBackupPaid?: boolean;
  isFreeBackupsLimitReached?: boolean;

  toDefault: VoidFunction;
  setBasePath: (folders: TBreadCrumb[]) => void;
  setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;
  settingsFileSelector: FilesSelectorSettings;
}

const defaultState = {
  visible: false,
  data: null,
};

const RoomsModule = ({
  onMakeCopy,
  buttonSize,
  isMaxProgress,
  basePath,
  isErrorPath,
  newPath,
  maxWidth,
  setBasePath,
  setNewPath,
  toDefault,
  currentDeviceType,
  settingsFileSelector,
  isBackupPaid,
  isFreeBackupsLimitReached,
}: RoomsModuleProps) => {
  const { t } = useTranslation(["Common"]);

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

  const folderRef = useRef("");
  const isMountRef = useRef(false);

  const [isStartCopy, setIsStartCopy] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | number>(() => {
    folderRef.current = getFromLocalStorage("LocalCopyFolder") ?? "";
    const moduleType = getFromLocalStorage("LocalCopyStorageType");

    return moduleType === Documents ? folderRef.current : "";
  });

  useEffect(() => {
    isMountRef.current = true;
    return () => {
      isMountRef.current = false;
    };
  }, []);

  const onSelectFolder = (folderId: string | number | undefined) => {
    if (isMountRef.current && !isNullOrUndefined(folderId))
      setSelectedFolder(folderId);
  };

  const handleMakeCopy = async () => {
    try {
      setIsStartCopy(true);
      await onMakeCopy(
        selectedFolder,
        Documents,
        `${BackupStorageType.DocumentModuleType}`,
      );
    } catch (error) {
      console.error(error);
      toastr.error(error as Error);
    } finally {
      setIsStartCopy(false);
    }
  };

  const isModuleDisabled = !isMaxProgress || isStartCopy;

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
          styles.manualBackupFolderInput,
          "manual-backup_folder-input",
        )}
      >
        <FilesSelectorInput
          withCreate
          isRoomBackup
          isSelectFolder
          newPath={newPath}
          basePath={basePath}
          maxWidth={maxWidth}
          toDefault={toDefault}
          formProps={formProps}
          setNewPath={setNewPath}
          isErrorPath={isErrorPath}
          setBasePath={setBasePath}
          isDisabled={isModuleDisabled}
          onSelectFolder={onSelectFolder}
          withoutInitPath={!selectedFolder}
          currentDeviceType={currentDeviceType}
          filesSelectorSettings={settingsFileSelector}
          setBackupToPublicRoomVisible={setBackupToPublicRoomVisible}
          {...(selectedFolder ? { id: selectedFolder } : { openRoot: true })}
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
      <div
        className={classNames(
          styles.manualBackupButtons,
          "manual-backup_buttons",
        )}
      >
        <Button
          primary
          id="create-copy"
          size={buttonSize}
          onClick={handleMakeCopy}
          label={t("Common:CreateCopy")}
          isDisabled={isModuleDisabled || !selectedFolder}
          testId="create_backup_room_button"
        />
      </div>
      <NoteComponent
        isVisible={Boolean(isBackupPaid && isFreeBackupsLimitReached)}
      />
    </div>
  );
};

export default RoomsModule;
