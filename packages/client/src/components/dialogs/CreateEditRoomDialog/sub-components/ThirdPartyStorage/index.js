// (c) Copyright Ascensio System SIA 2010-2024
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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { Link } from "@docspace/shared/components/link";
import { StyledParam } from "../Params/StyledParam";
import ToggleParam from "../Params/ToggleParam";
import ThirdPartyComboBox from "./ThirdPartyComboBox";

import FolderInput from "./FolderInput";
import { getOAuthToken } from "@docspace/shared/utils/common";
import { RoomsType } from "@docspace/shared/enums";
import { Checkbox } from "@docspace/shared/components/checkbox";

const StyledThirdPartyStorage = styled(StyledParam)`
  flex-direction: column;
  gap: 12px;

  .create-new-folder_checkbox {
    margin-top: 1px;
  }
`;

const ThirdPartyStorage = ({
  t,

  roomTitle,
  storageLocation,
  onChangeStorageLocation,

  setIsScrollLocked,
  setIsOauthWindowOpen,

  connectItems,
  setConnectDialogVisible,
  setRoomCreation,
  saveThirdpartyResponse,
  setSaveThirdpartyResponse,
  saveThirdParty,
  deleteThirdParty,
  openConnectWindow,
  setConnectItem,
  getOAuthToken,

  isDisabled,
  currentColorScheme,
  isRoomAdmin,
  roomType,
  createNewFolderIsChecked,
  onCreateFolderChange,
}) => {
  const onChangeIsThirdparty = () => {
    if (isDisabled) return;

    if (!connectItems.length) {
      const data = isRoomAdmin ? (
        <Text as="p">{t("ThirdPartyStorageRoomAdminNoStorageAlert")}</Text>
      ) : (
        <Text as="p">
          {t("ThirdPartyStorageNoStorageAlert")}{" "}
          <Link
            href="/portal-settings/integration/third-party-services"
            type="page"
            noHover
            color={currentColorScheme.main?.accent}
          >
            {t("Translations:ThirdPartyTitle")}
          </Link>
        </Text>
      );

      toastr.warning(data, null, 5000, true, false);

      return;
    }

    onChangeStorageLocation({
      ...storageLocation,
      isThirdparty: !storageLocation.isThirdparty,
    });
  };

  const onChangeProvider = async (provider) => {
    if (!!storageLocation.thirdpartyAccount) {
      onChangeStorageLocation({
        ...storageLocation,
        provider,
        thirdpartyAccount: null,
      });
      await deleteThirdParty(storageLocation.thirdpartyAccount.providerId);
      return;
    }

    onChangeStorageLocation({ ...storageLocation, provider });
  };

  const onChangeStorageFolderId = (storageFolderId) =>
    onChangeStorageLocation({
      ...storageLocation,
      storageFolderId,
    });

  const isPublicRoom = roomType === RoomsType.PublicRoom;

  return (
    <StyledThirdPartyStorage>
      {isPublicRoom && (
        <ToggleParam
          id="shared_third-party-storage-toggle"
          title={t("Common:ThirdPartyStorage")}
          description={t("ThirdPartyStorageDescription")}
          isChecked={storageLocation.isThirdparty}
          onCheckedChange={onChangeIsThirdparty}
        />
      )}

      {storageLocation.isThirdparty && (
        <ThirdPartyComboBox
          t={t}
          storageLocation={storageLocation}
          onChangeStorageLocation={onChangeStorageLocation}
          onChangeProvider={onChangeProvider}
          connectItems={connectItems}
          setConnectDialogVisible={setConnectDialogVisible}
          setRoomCreation={setRoomCreation}
          saveThirdParty={saveThirdParty}
          saveThirdpartyResponse={saveThirdpartyResponse}
          setSaveThirdpartyResponse={setSaveThirdpartyResponse}
          openConnectWindow={openConnectWindow}
          setConnectItem={setConnectItem}
          getOAuthToken={getOAuthToken}
          setIsScrollLocked={setIsScrollLocked}
          setIsOauthWindowOpen={setIsOauthWindowOpen}
          isDisabled={isDisabled}
        />
      )}

      {storageLocation.isThirdparty && storageLocation.thirdpartyAccount && (
        <>
          <FolderInput
            t={t}
            roomTitle={roomTitle}
            thirdpartyAccount={storageLocation.thirdpartyAccount}
            onChangeStorageFolderId={onChangeStorageFolderId}
            isDisabled={isDisabled}
          />

          <Checkbox
            className="create-new-folder_checkbox"
            label={t("Files:CreateNewFolderInStorage")}
            isChecked={createNewFolderIsChecked}
            onChange={onCreateFolderChange}
          />
        </>
      )}
    </StyledThirdPartyStorage>
  );
};

export default inject(
  ({ authStore, settingsStore, filesSettingsStore, dialogsStore }) => {
    const { currentColorScheme } = settingsStore;

    const { openConnectWindow, saveThirdParty, deleteThirdParty } =
      filesSettingsStore.thirdPartyStore;

    const {
      setConnectItem,
      setConnectDialogVisible,
      setRoomCreation,
      saveThirdpartyResponse,
      setSaveThirdpartyResponse,
    } = dialogsStore;

    const thirdPartyStore = filesSettingsStore.thirdPartyStore;

    const connectItems = [
      thirdPartyStore.googleConnectItem,
      thirdPartyStore.boxConnectItem,
      thirdPartyStore.dropboxConnectItem,
      thirdPartyStore.oneDriveConnectItem,
      thirdPartyStore.nextCloudConnectItem && [
        ...thirdPartyStore.nextCloudConnectItem,
        "Nextcloud",
      ],
      thirdPartyStore.kDriveConnectItem,
      thirdPartyStore.yandexConnectItem,
      thirdPartyStore.ownCloudConnectItem && [
        ...thirdPartyStore.ownCloudConnectItem,
        "ownCloud",
      ],
      thirdPartyStore.webDavConnectItem,
      thirdPartyStore.sharePointConnectItem,
    ]
      .map(
        (item) =>
          item && {
            id: item[0],
            className: `storage_${item[0].toLowerCase()}`,
            providerKey: item[0],
            isOauth: item.length > 1 && item[0] !== "WebDav",
            oauthHref: item.length > 1 && item[0] !== "WebDav" ? item[1] : "",
            ...(item[0] === "WebDav" && {
              category: item[item.length - 1],
            }),
          },
      )
      .filter((item) => !!item);

    const { isRoomAdmin } = authStore;

    return {
      connectItems,

      setConnectDialogVisible,
      setRoomCreation,

      saveThirdParty,
      deleteThirdParty,

      saveThirdpartyResponse,
      setSaveThirdpartyResponse,

      openConnectWindow,
      setConnectItem,
      getOAuthToken,
      currentColorScheme,
      isRoomAdmin,
    };
  },
)(observer(ThirdPartyStorage));
