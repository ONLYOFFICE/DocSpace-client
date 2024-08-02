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
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { SettingsCommonSkeleton } from "@docspace/shared/skeletons/settings";

import StyledWrapper from "./styled-file-management";

const FileManagement = ({
  storeOriginalFiles,
  confirmDelete,
  forceSave,

  isVisitor,
  //favoritesSection,
  //recentSection,

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

  openEditorInSameTab,
  setOpenEditorInSameTab,

  displayFileExtension,
  setDisplayFileExtension,
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

  const onChangeForceSave = React.useCallback(() => {
    setForceSave(!forceSave);
  }, [setForceSave, forceSave]);

  const onChangeThumbnailsSize = React.useCallback(() => {
    setThumbnails1280x720(!thumbnails1280x720);
  }, [setThumbnails1280x720, thumbnails1280x720]);

  const onChangeKeepNewFileName = React.useCallback(() => {
    setKeepNewFileName(!keepNewFileName);
  }, [setKeepNewFileName, keepNewFileName]);

  const onChangeDisplayFileExtension = React.useCallback(() => {
    setDisplayFileExtension(!displayFileExtension);
  }, [setDisplayFileExtension, displayFileExtension]);

  const onChangeOpenEditorInSameTab = React.useCallback(() => {
    setOpenEditorInSameTab(!openEditorInSameTab);
  }, [setOpenEditorInSameTab, openEditorInSameTab]);

  const onChangeFavorites = React.useCallback(
    (e) => {
      setIsLoadingFavorites(true);
      setFavoritesSetting(e.target.checked, "favoritesSection")
        .catch((err) => toastr.error(err))
        .finally(() => setIsLoadingFavorites(false));
    },
    [setIsLoadingFavorites, setFavoritesSetting],
  );

  const onChangeRecent = React.useCallback(
    (e) => {
      setIsLoadingRecent(true);
      setRecentSetting(e.target.checked, "recentSection")
        .catch((err) => toastr.error(err))
        .finally(() => setIsLoadingRecent(false));
    },
    [setIsLoadingRecent, setRecentSetting],
  );

  const thumbnailsSizeLabel = "Thumbnails 1280x720";

  if (!ready) return <SettingsCommonSkeleton />;
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
              className="open-same-tab toggle-btn"
              onChange={onChangeOpenEditorInSameTab}
              isChecked={openEditorInSameTab}
            />
            <Text>
              {t("OpenSameTab", {
                organizationName: t("Common:OrganizationName"),
              })}
            </Text>
          </div>
        )}
        {!isVisitor && (
          <div className="toggle-btn-wrapper">
            <ToggleButton
              className="display-file-extension toggle-btn"
              onChange={onChangeDisplayFileExtension}
              isChecked={displayFileExtension}
            />
            <Text>{t("DisplayFileExtension")}</Text>
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

export default inject(({ userStore, filesSettingsStore, treeFoldersStore }) => {
  const {
    storeOriginalFiles,
    confirmDelete,
    forcesave,

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

    openEditorInSameTab,
    setOpenEditorInSameTab,

    displayFileExtension,
    setDisplayFileExtension,
  } = filesSettingsStore;

  const { myFolderId, commonFolderId } = treeFoldersStore;

  return {
    storeOriginalFiles,
    confirmDelete,
    forceSave: forcesave,

    myFolderId,
    commonFolderId,
    isVisitor: userStore.user.isVisitor,
    favoritesSection,
    recentSection,

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

    openEditorInSameTab,
    setOpenEditorInSameTab,

    displayFileExtension,
    setDisplayFileExtension,
  };
})(observer(FileManagement));
