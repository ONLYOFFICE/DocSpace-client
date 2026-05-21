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

import { BackupStorageType, ProvidersType } from "../../../../../enums";
import { DirectThirdPartyConnection } from "../../../../../components/direct-third-party-connection";
import { useDidMount } from "../../../../../hooks/useDidMount";

import styles from "../../AutoBackup.module.scss";
import { ScheduleComponent } from "../ScheduleComponent";
import { ThirdPartyModuleProps } from "./ThirdPartyModule.types";
import NoteComponent from "../../../sub-components/NoteComponent";

const ThirdPartyModule = ({
  isError,
  buttonSize,
  isLoadingData,
  defaultFolderId,
  defaultStorageType,
  setSelectedFolder,
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
  setDefaultFolderId,
  isBackupPaid,
  isFreeBackupsLimitReached,
}: ThirdPartyModuleProps) => {
  const isResourcesDefault =
    defaultStorageType === BackupStorageType.ResourcesModuleType.toString();
  const passedId =
    isResourcesDefault && defaultFolderId ? defaultFolderId : undefined;

  useDidMount(() => {
    if (isResourcesDefault && defaultFolderId) {
      setSelectedFolder(defaultFolderId);
    } else setSelectedFolder("");
  });

  const onSelectFolder = (id: string | number | undefined) => {
    setSelectedFolder(`${id}`);
  };

  const checkCreating = selectedThirdPartyAccount?.key === ProvidersType.WebDav;

  const withoutInitPath = isResourcesDefault ? !passedId : true;

  return (
    <div data-testid="third-party-module">
      <div
        className={classNames(
          styles.autoBackupThirdPartyModule,
          "auto-backup_third-party-module",
        )}
      >
        <DirectThirdPartyConnection
          id={passedId}
          isError={isError}
          buttonSize={buttonSize}
          isDisabled={isLoadingData}
          checkCreating={checkCreating}
          onSelectFolder={onSelectFolder}
          withoutInitPath={withoutInitPath}
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
          dataTestId="auto_backup"
          setDefaultFolderId={setDefaultFolderId}
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
      <NoteComponent
        isVisible={Boolean(isBackupPaid && isFreeBackupsLimitReached)}
      />
    </div>
  );
};

export default ThirdPartyModule;
