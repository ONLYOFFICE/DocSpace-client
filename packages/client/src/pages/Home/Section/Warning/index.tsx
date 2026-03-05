// (c) Copyright Ascensio System SIA 2009-2026
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
import { inject, observer } from "mobx-react";

import WarningComponent from "@docspace/ui-kit/components/navigation/sub-components/WarningComponent";
import { DeviceType } from "@docspace/shared/enums";
import WarningQuotaExceededUrl from "PUBLIC_DIR/images/warning.quota-exceeded.react.svg?url";
import { getWarningText } from "../getWarningText";

type InjectedProps = {
  isPersonalReadOnly: boolean;
  isRecycleBinFolder: boolean;
  currentDeviceType: DeviceType;
  isRoomStorageQuotaExceeded: boolean;
  selectedFolderUsedSpace?: number;
  selectedFolderQuotaLimit?: number;
  showHeaderLoader?: boolean;
};

const Warning = ({
  isPersonalReadOnly = false,
  isRecycleBinFolder = false,
  currentDeviceType = DeviceType.desktop,
  isRoomStorageQuotaExceeded,
  selectedFolderUsedSpace,
  selectedFolderQuotaLimit,
  showHeaderLoader,
}: InjectedProps) => {
  const { t } = useTranslation(["Files", "Common"]);

  if (currentDeviceType === DeviceType.desktop) return null;

  const warningText = getWarningText({
    t,
    isRecycleBinFolder,
    isPersonalReadOnly,
    isRoomStorageQuotaExceeded,
    roomUsedSpace: selectedFolderUsedSpace,
    roomQuotaLimit: selectedFolderQuotaLimit,
  });

  if (showHeaderLoader || !warningText) return null;

  return (
    <WarningComponent
      title={warningText}
      icon={isRoomStorageQuotaExceeded ? WarningQuotaExceededUrl : undefined}
    />
  );
};

export default inject(
  ({
    treeFoldersStore,
    settingsStore,
    selectedFolderStore,
    clientLoadingStore,
  }: TStore) => {
    const { isRecycleBinFolder, isPersonalReadOnly } = treeFoldersStore;
    const { currentDeviceType } = settingsStore;
    const { isRoomStorageQuotaExceeded, roomUsedSpace, roomQuotaLimit } =
      selectedFolderStore;

    const { showHeaderLoader } = clientLoadingStore;

    return {
      isPersonalReadOnly,
      isRecycleBinFolder,
      currentDeviceType,
      isRoomStorageQuotaExceeded,
      selectedFolderUsedSpace: roomUsedSpace,
      selectedFolderQuotaLimit: roomQuotaLimit,
      showHeaderLoader,
    };
  },
)(observer(Warning));
