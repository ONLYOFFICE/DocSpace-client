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
import { useTranslation } from "react-i18next";

import { FilesSelectorFilterTypes } from "../../../enums";
import {
  DirectThirdPartyConnection,
  DirectThirdPartyConnectionProps,
} from "../../../components/direct-third-party-connection";
import type { FileInfoType } from "../../../components/files-selector-input/FilesSelectorInput.types";

export interface ThirdPartyResourcesProps
  extends Omit<
    DirectThirdPartyConnectionProps,
    | "isSelect"
    | "isMobileScale"
    | "withoutInitPath"
    | "onSelectFile"
    | "descriptionText"
    | "filterParam"
  > {
  setRestoreResource: (res: File | string | number) => void;
}

const ThirdPartyResources = ({
  setRestoreResource,
  buttonSize,

  openConnectWindow,
  connectDialogVisible,
  deleteThirdPartyDialogVisible,
  connectedThirdPartyAccount,
  setConnectDialogVisible,
  setDeleteThirdPartyDialogVisible,
  clearLocalStorage,
  setSelectedThirdPartyAccount,
  isTheSameThirdPartyAccount,
  selectedThirdPartyAccount,
  accounts,
  setThirdPartyAccountsInfo,
  deleteThirdParty,
  setConnectedThirdPartyAccount,
  setThirdPartyProviders,
  providers,
  removeItem,
  newPath,
  basePath,
  isErrorPath,
  filesSelectorSettings,
  setBasePath,
  toDefault,
  setNewPath,
}: ThirdPartyResourcesProps) => {
  const { t } = useTranslation(["Common"]);

  const onSelectFile = (file: FileInfoType) => {
    setRestoreResource(file.id);
  };

  return (
    <div className="restore-backup_third-party-module">
      <DirectThirdPartyConnection
        isSelect
        isMobileScale
        withoutInitPath
        buttonSize={buttonSize}
        onSelectFile={onSelectFile}
        descriptionText={t("Common:SelectFileInGZFormat")}
        filterParam={FilesSelectorFilterTypes.BackupOnly}
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
  );
};

export default ThirdPartyResources;

// export default inject(({ backup }) => {
//   const { setRestoreResource } = backup;

//   return {
//     setRestoreResource,
//   };
// })(observer(ThirdPartyResources));
