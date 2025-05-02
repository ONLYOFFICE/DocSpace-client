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

import { BackupStorageType } from "@docspace/shared/enums";
import {
  DirectThirdPartyConnection,
  type DirectThirdPartyConnectionProps,
} from "@docspace/shared/components/direct-third-party-connection";
import { useDidMount } from "@docspace/shared/hooks/useDidMount";

import type { Nullable } from "@docspace/shared/types";

import {
  ScheduleComponent,
  type ScheduleComponentProps,
} from "./ScheduleComponent";

interface ThirdPartyModuleProps
  extends Omit<
      DirectThirdPartyConnectionProps,
      | "onSelectFolder"
      | "isDisabled"
      | "id"
      | "withoutInitPath"
      | "descriptionText"
      | "filterParam"
      | "isMobileScale"
      | "isSelect"
      | "isSelectFolder"
      | "onSelectFile"
    >,
    ScheduleComponentProps {
  isLoadingData: boolean;
  setSelectedFolder: (id: string) => void;
  defaultStorageType: Nullable<string>;
  defaultFolderId: Nullable<string>;
}

const ThirdPartyModule = ({
  isError,
  buttonSize,
  isLoadingData,
  defaultFolderId,
  defaultStorageType,
  setSelectedFolder,

  // DirectThirdPartyConnection
  accounts,
  basePath,
  clearLocalStorage,
  connectDialogVisible,
  connectedThirdPartyAccount,
  deleteThirdParty,
  deleteThirdPartyDialogVisible,
  filesSelectorSettings,
  isErrorPath,
  isTheSameThirdPartyAccount,
  newPath,
  openConnectWindow,
  providers,
  removeItem,
  selectedThirdPartyAccount,
  setBasePath,
  setConnectDialogVisible,
  setConnectedThirdPartyAccount,
  setDeleteThirdPartyDialogVisible,
  setNewPath,
  setSelectedThirdPartyAccount,
  setThirdPartyAccountsInfo,
  setThirdPartyProviders,
  toDefault,

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
  setMaxCopies,
  setMonthNumber,
  setPeriod,
  setTime,
  setWeekday,
  weekdaysLabelArray,
}: ThirdPartyModuleProps) => {
  const isResourcesDefault =
    defaultStorageType === BackupStorageType.ResourcesModuleType.toString();
  const passedId = isResourcesDefault ? (defaultFolderId ?? "") : "";

  useDidMount(() => {
    if (!isResourcesDefault) setSelectedFolder("");
  });

  const onSelectFolder = (id: string | number | undefined) => {
    setSelectedFolder(`${id}`);
  };

  return (
    <>
      <div className="auto-backup_third-party-module">
        <DirectThirdPartyConnection
          id={passedId}
          isError={isError}
          buttonSize={buttonSize}
          isDisabled={isLoadingData}
          onSelectFolder={onSelectFolder}
          withoutInitPath={!isResourcesDefault}
          openConnectWindow={openConnectWindow}
          connectDialogVisible={connectDialogVisible}
          deleteThirdPartyDialogVisible={deleteThirdPartyDialogVisible}
          connectedThirdPartyAccount={connectedThirdPartyAccount}
          setConnectDialogVisible={setConnectDialogVisible}
          setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
          clearLocalStorage={clearLocalStorage}
          setSelectedThirdPartyAccount={setSelectedThirdPartyAccount}
          isTheSameThirdPartyAccount={isTheSameThirdPartyAccount}
          selectedThirdPartyAccount={selectedThirdPartyAccount}
          accounts={accounts}
          setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
          deleteThirdParty={deleteThirdParty}
          setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
          setThirdPartyProviders={setThirdPartyProviders}
          providers={providers}
          removeItem={removeItem}
          newPath={newPath}
          basePath={basePath}
          isErrorPath={isErrorPath}
          filesSelectorSettings={filesSelectorSettings}
          setBasePath={setBasePath}
          toDefault={toDefault}
          setNewPath={setNewPath}
        />
      </div>
      <ScheduleComponent
        isLoadingData={isLoadingData}
        selectedPeriodLabel={selectedPeriodLabel}
        selectedWeekdayLabel={selectedWeekdayLabel}
        selectedHour={selectedHour}
        selectedMonthDay={selectedMonthDay}
        selectedMaxCopiesNumber={selectedMaxCopiesNumber}
        selectedPeriodNumber={selectedPeriodNumber}
        setMaxCopies={setMaxCopies}
        setPeriod={setPeriod}
        setWeekday={setWeekday}
        setMonthNumber={setMonthNumber}
        setTime={setTime}
        periodsObject={periodsObject}
        weekdaysLabelArray={weekdaysLabelArray}
        monthNumbersArray={monthNumbersArray}
        hoursArray={hoursArray}
        maxNumberCopiesArray={maxNumberCopiesArray}
      />
    </>
  );
};

export default ThirdPartyModule;

// export default inject(({ backup }) => {
//   const {
//     setSelectedFolder,

//     defaultStorageType,
//     commonThirdPartyList,
//     defaultFolderId,
//   } = backup;

//   const isResourcesDefault =
//     defaultStorageType === `${BackupStorageType.ResourcesModuleType}`;
//   const passedId = isResourcesDefault ? defaultFolderId : "";

//   return {
//     setSelectedFolder,
//     passedId,
//     commonThirdPartyList,
//     isResourcesDefault,
//   };
// })(withTranslation(["Settings", "Common"])(observer(ThirdPartyModule)));
