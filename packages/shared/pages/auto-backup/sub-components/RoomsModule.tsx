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

import React from "react";

import { BackupStorageType, type DeviceType } from "@docspace/shared/enums";
import {
  FilesSelectorInput,
  type FilesSelectorSettings,
} from "@docspace/shared/components/files-selector-input";
import type { Nullable } from "@docspace/shared/types";
import type { TBreadCrumb } from "@docspace/shared/components/selector/Selector.types";

import {
  ScheduleComponent,
  type ScheduleComponentProps,
} from "./ScheduleComponent";

interface RoomsModuleProps extends ScheduleComponentProps {
  isError: boolean;
  isLoadingData: boolean;
  settingsFileSelector: FilesSelectorSettings;
  currentDeviceType?: DeviceType;

  // filesSelectorInput
  basePath: string;
  newPath: string;
  toDefault: VoidFunction;
  isErrorPath: boolean;
  setBasePath: (folders: TBreadCrumb[]) => void;
  setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;
  // end filesSelectorInput

  // backup store
  defaultStorageType: Nullable<string>;
  setSelectedFolder: (id: string) => void;
  defaultFolderId: Nullable<string>;
  // end back store
}

const RoomsModule = ({
  isError,
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
}: RoomsModuleProps) => {
  const isDocumentsDefault =
    defaultStorageType === BackupStorageType.DocumentModuleType.toString();

  const passedId = isDocumentsDefault ? defaultFolderId : "";

  const onSelectFolder = (id: string | number | undefined) => {
    setSelectedFolder(`${id}`);
  };

  return (
    <>
      <div className="auto-backup_folder-input">
        <FilesSelectorInput
          withCreate
          isRoomBackup
          isSelectFolder
          newPath={newPath}
          isError={isError}
          basePath={basePath}
          isErrorPath={isErrorPath}
          isDisabled={isLoadingData}
          withoutInitPath={!isDocumentsDefault}
          currentDeviceType={currentDeviceType}
          filesSelectorSettings={settingsFileSelector}
          toDefault={toDefault}
          setNewPath={setNewPath}
          setBasePath={setBasePath}
          onSelectFolder={onSelectFolder}
          {...(passedId ? { id: passedId } : { openRoot: true })}
        />
      </div>
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
    </>
  );
};

export default RoomsModule;

// export default inject(({ backup }) => {
//   const {
//     setSelectedFolder,
//     defaultStorageType,
//     defaultFolderId,
//   } = backup;

//   const isDocumentsDefault =
//     defaultStorageType === `${BackupStorageType.DocumentModuleType}`;

//   const passedId = isDocumentsDefault ? defaultFolderId : "";

//   return {
//     defaultFolderId,
//     setSelectedFolder,
//     passedId,
//     isDocumentsDefault,
//   };
// })(observer(RoomsModule));