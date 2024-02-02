import React from "react";
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

const StyledThirdPartyStorage = styled(StyledParam)`
  flex-direction: column;
  gap: 12px;
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

  return (
    <StyledThirdPartyStorage>
      <ToggleParam
        id="shared_third-party-storage-toggle"
        title={t("Common:ThirdPartyStorage")}
        description={t("ThirdPartyStorageDescription")}
        isChecked={storageLocation.isThirdparty}
        onCheckedChange={onChangeIsThirdparty}
      />

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
        <FolderInput
          t={t}
          roomTitle={roomTitle}
          thirdpartyAccount={storageLocation.thirdpartyAccount}
          onChangeStorageFolderId={onChangeStorageFolderId}
          isDisabled={isDisabled}
        />
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
          }
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
  }
)(observer(ThirdPartyStorage));
