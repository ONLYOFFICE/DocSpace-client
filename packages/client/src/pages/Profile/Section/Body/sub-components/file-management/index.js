import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import ToggleButton from "@docspace/components/toggle-button";
import Box from "@docspace/components/box";
import Text from "@docspace/components/text";
import Loaders from "@docspace/common/components/Loaders";

import StyledWrapper from "./styled-file-management";

const FileManagement = ({
  storeOriginalFiles,
  confirmDelete,
  updateIfExist,
  forceSave,

  isVisitor,
  //favoritesSection,
  //recentSection,

  setUpdateIfExist,
  setStoreOriginal,

  setConfirmDelete,

  setForceSave,

  setFavoritesSetting,
  setRecentSetting,

  showTitle,

  showAdminSettings,

  keepNewFileName,
  setKeepNewFileName,
  setThumbnails1280x720,
  thumbnails1280x720,
}) => {
  const { t, ready } = useTranslation(["FilesSettings", "Common"]);

  const [isLoadingFavorites, setIsLoadingFavorites] = React.useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = React.useState(false);

  const onChangeOriginalCopy = React.useCallback(() => {
    setStoreOriginal(!storeOriginalFiles, "storeOriginalFiles");
  }, [setStoreOriginal, storeOriginalFiles]);

  const onChangeDeleteConfirm = React.useCallback(() => {
    setConfirmDelete(!confirmDelete, "confirmDelete");
  }, [setConfirmDelete, confirmDelete]);

  const onChangeUpdateIfExist = React.useCallback(() => {
    setUpdateIfExist(!updateIfExist, "updateIfExist");
  }, [setUpdateIfExist, updateIfExist]);

  const onChangeForceSave = React.useCallback(() => {
    setForceSave(!forceSave);
  }, [setForceSave, forceSave]);

  const onChangeThumbnailsSize = React.useCallback(() => {
    setThumbnails1280x720(!thumbnails1280x720);
  }, [setThumbnails1280x720, thumbnails1280x720]);

  const onChangeKeepNewFileName = React.useCallback(() => {
    setKeepNewFileName(!keepNewFileName);
  }, [setKeepNewFileName, keepNewFileName]);

  const onChangeFavorites = React.useCallback(
    (e) => {
      setIsLoadingFavorites(true);
      setFavoritesSetting(e.target.checked, "favoritesSection")
        .catch((err) => toastr.error(err))
        .finally(() => setIsLoadingFavorites(false));
    },
    [setIsLoadingFavorites, setFavoritesSetting]
  );

  const onChangeRecent = React.useCallback(
    (e) => {
      setIsLoadingRecent(true);
      setRecentSetting(e.target.checked, "recentSection")
        .catch((err) => toastr.error(err))
        .finally(() => setIsLoadingRecent(false));
    },
    [setIsLoadingRecent, setRecentSetting]
  );

  const thumbnailsSizeLabel = "Thumbnails 1280x720";

  if (!ready) return <Loaders.SettingsCommon />;
  return (
    <StyledWrapper showTitle={showTitle} hideAdminSettings={!showAdminSettings}>
      <Box className="settings-section">
        {/* {showTitle && (
          <Heading className="heading" level={2} size="xsmall">
            {t("Common:Common")}
          </Heading>
        )} */}
        <ToggleButton
          className="toggle-btn"
          label={thumbnailsSizeLabel}
          onChange={onChangeThumbnailsSize}
          isChecked={thumbnails1280x720}
          style={{ display: "none" }}
        />
        {!isVisitor && (
          <div className="toggle-btn-wrapper">
            <ToggleButton
              className="ask-again toggle-btn"
              onChange={onChangeKeepNewFileName}
              isChecked={keepNewFileName}
            />
            <Text>{t("Common:DontAskAgain")}</Text>
          </div>
        )}
        <div className="toggle-btn-wrapper">
          <ToggleButton
            className="save-copy-original toggle-btn"
            onChange={onChangeOriginalCopy}
            isChecked={storeOriginalFiles}
          />
          <Text>{t("OriginalCopy")}</Text>
        </div>
        {!isVisitor && (
          <div className="toggle-btn-wrapper">
            <ToggleButton
              className="display-notification toggle-btn"
              onChange={onChangeDeleteConfirm}
              isChecked={confirmDelete}
            />
            <Text>{t("DisplayNotification")}</Text>
          </div>
        )}
        {!isVisitor && (
          <div className="toggle-btn-wrapper">
            <ToggleButton
              className="toggle-btn"
              onChange={onChangeUpdateIfExist}
              isChecked={updateIfExist}
            />
            <Text>{t("UpdateOrCreate")}</Text>
          </div>
        )}
      </Box>

      {/* <Box className="settings-section">
        <Heading className="heading" level={2} size="xsmall">
          {t("AdditionalSections")}
        </Heading>
        <ToggleButton
          isDisabled={isLoadingRecent}
          className="toggle-btn"
          label={t("DisplayRecent")}
          onChange={onChangeRecent}
          isChecked={recentSection}
        />

        <ToggleButton
          isDisabled={isLoadingFavorites}
          className="toggle-btn"
          label={t("DisplayFavorites")}
          onChange={onChangeFavorites}
          isChecked={favoritesSection}
        />
        <ToggleButton
          isDisabled={true}
          className="toggle-btn"
          label={t("DisplayTemplates")}
          onChange={(e) => console.log(e)}
          isChecked={false}
        />
      </Box> */}

      {/* {!isVisitor && (
        <Box className="settings-section">
          <Heading className="heading" level={2} size="xsmall">
            {t("StoringFileVersion")}
          </Heading>
          {!isVisitor && (
            <ToggleButton
              className="update-or-create toggle-btn"
              label={t("UpdateOrCreate")}
              onChange={onChangeUpdateIfExist}
              isChecked={updateIfExist}
            />
          )}
          {!isVisitor && (
            <ToggleButton
              className="keep-intermediate-version toggle-btn"
              label={t("KeepIntermediateVersion")}
              onChange={onChangeForceSave}
              isChecked={forceSave}
            />
          )}
        </Box>
      )} */}
    </StyledWrapper>
  );
};

export default inject(({ auth, settingsStore, treeFoldersStore }) => {
  const {
    storeOriginalFiles,
    confirmDelete,
    updateIfExist,
    forcesave,

    setUpdateIfExist,
    setStoreOriginal,

    setConfirmDelete,

    setForceSave,

    favoritesSection,
    recentSection,
    setFavoritesSetting,
    setRecentSetting,

    keepNewFileName,
    setKeepNewFileName,

    setThumbnails1280x720,
    thumbnails1280x720,
  } = settingsStore;

  const { myFolderId, commonFolderId } = treeFoldersStore;

  return {
    storeOriginalFiles,
    confirmDelete,
    updateIfExist,
    forceSave: forcesave,

    myFolderId,
    commonFolderId,
    isVisitor: auth.userStore.user.isVisitor,
    favoritesSection,
    recentSection,

    setUpdateIfExist,
    setStoreOriginal,

    setConfirmDelete,

    setForceSave,

    setFavoritesSetting,
    setRecentSetting,
    myFolderId,
    commonFolderId,

    keepNewFileName,
    setKeepNewFileName,

    setThumbnails1280x720,
    thumbnails1280x720,
  };
})(observer(FileManagement));
