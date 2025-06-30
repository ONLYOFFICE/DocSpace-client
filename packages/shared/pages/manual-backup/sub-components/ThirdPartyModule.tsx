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

import { useTranslation } from "react-i18next";
import React, { useRef, useEffect, useState } from "react";

import { BackupStorageType, ProvidersType } from "../../../enums";
import { isNullOrUndefined } from "../../../utils/typeGuards";
import { Button, type ButtonSize } from "../../../components/button";
import { getFromLocalStorage } from "../../../utils/getFromLocalStorage";
import { DirectThirdPartyConnection } from "../../../components/direct-third-party-connection";

import type {
  ConnectedThirdPartyAccountType,
  Nullable,
  ThirdPartyAccountType,
  TTranslation,
} from "../../../types";
import type { TBreadCrumb } from "../../../components/selector/Selector.types";
import type { FilesSelectorSettings } from "../../../components/files-selector-input";
import type { TThirdParties } from "../../../api/files/types";

interface ThirdPartyModuleProps {
  onMakeCopy: (
    selectedFolder: string | number,
    moduleName: string,
    moduleType: string,
    selectedStorageId?: string,
    selectedStorageTitle?: string,
  ) => Promise<void>;
  isMaxProgress: boolean;
  buttonSize?: ButtonSize;
  connectedThirdPartyAccount: Nullable<ConnectedThirdPartyAccountType>;
  isTheSameThirdPartyAccount: boolean;

  openConnectWindow: (
    serviceName: string,
    modal: Window | null,
  ) => Promise<Window | null>;
  connectDialogVisible: boolean;
  deleteThirdPartyDialogVisible: boolean;
  setConnectDialogVisible: (visible: boolean) => void;
  setDeleteThirdPartyDialogVisible: (visible: boolean) => void;
  clearLocalStorage: VoidFunction;
  setSelectedThirdPartyAccount: (
    elem: Nullable<Partial<ThirdPartyAccountType>>,
  ) => void;
  selectedThirdPartyAccount: Nullable<ThirdPartyAccountType>;
  accounts: ThirdPartyAccountType[];
  setThirdPartyAccountsInfo: (t: TTranslation) => Promise<void>;
  deleteThirdParty: (id: string) => Promise<void>;
  setConnectedThirdPartyAccount: (
    account: Nullable<ConnectedThirdPartyAccountType>,
  ) => void;
  setThirdPartyProviders: (providers: TThirdParties) => void;
  providers: TThirdParties;
  removeItem: ThirdPartyAccountType;
  newPath: string;
  basePath: string;
  isErrorPath: boolean;
  filesSelectorSettings: FilesSelectorSettings;
  setBasePath: (folders: TBreadCrumb[]) => void;
  toDefault: VoidFunction;
  setNewPath: (folders: TBreadCrumb[], fileName?: string) => void;
}

const ThirdPartyResource = "ThirdPartyResource";

const ThirdPartyModule = ({
  onMakeCopy,
  isMaxProgress,
  buttonSize,
  connectedThirdPartyAccount,
  isTheSameThirdPartyAccount,

  openConnectWindow,
  connectDialogVisible,
  deleteThirdPartyDialogVisible,
  setConnectDialogVisible,
  setDeleteThirdPartyDialogVisible,
  clearLocalStorage,
  setSelectedThirdPartyAccount,
  selectedThirdPartyAccount,
  accounts,
  setThirdPartyAccountsInfo,
  deleteThirdParty,
  setConnectedThirdPartyAccount,
  setThirdPartyProviders,
  providers,
  removeItem,
  basePath,
  isErrorPath,
  newPath,
  filesSelectorSettings,
  setBasePath,
  setNewPath,
  toDefault,
}: ThirdPartyModuleProps) => {
  const isMountRef = useRef(false);
  const folderRef = useRef("");

  const [isError, setIsError] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [isStartCopy, setIsStartCopy] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | number>(() => {
    folderRef.current = getFromLocalStorage("LocalCopyFolder") ?? "";
    const moduleType = getFromLocalStorage<string>("LocalCopyStorageType");
    return moduleType === ThirdPartyResource ? folderRef.current : "";
  });

  const { t } = useTranslation(["Common"]);

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

  const isInvalidForm = () => {
    if (selectedFolder) return false;

    setIsError(true);

    return true;
  };

  const handleMakeCopy = async () => {
    if (isInvalidForm()) return;

    if (isError) setIsError(false);

    setIsStartCopy(true);

    await onMakeCopy(
      selectedFolder,
      ThirdPartyResource,
      `${BackupStorageType.ResourcesModuleType}`,
    );

    setIsStartCopy(false);
  };

  const isModuleDisabled = !isMaxProgress || isStartCopy;

  const checkCreating = selectedThirdPartyAccount?.key === ProvidersType.WebDav;

  return (
    <div className="manual-backup_third-party-module">
      <DirectThirdPartyConnection
        checkCreating={checkCreating}
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
        onSelectFolder={onSelectFolder}
        isDisabled={isModuleDisabled}
        {...(selectedFolder && { id: selectedFolder })}
        withoutInitPath={!selectedFolder}
        isError={isError}
        buttonSize={buttonSize}
        isSelectFolder
      />

      {connectedThirdPartyAccount?.id && isTheSameThirdPartyAccount ? (
        <Button
          primary
          size={buttonSize}
          onClick={handleMakeCopy}
          label={t("Common:CreateCopy")}
          isDisabled={isModuleDisabled || selectedFolder === ""}
        />
      ) : null}
    </div>
  );
};

export default ThirdPartyModule;

// export default inject(({ backup }) => {
//   const { connectedThirdPartyAccount, isTheSameThirdPartyAccount } = backup;

//   return {
//     connectedThirdPartyAccount,
//     isTheSameThirdPartyAccount,
//   };
// })(withTranslation(["Settings", "Common"])(observer(ThirdPartyModule)));
