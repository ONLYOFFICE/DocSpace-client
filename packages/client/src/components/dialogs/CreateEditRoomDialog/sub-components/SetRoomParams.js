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

import React, { useState } from "react";
import styled, { css } from "styled-components";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import RoomTypeDropdown from "./RoomTypeDropdown";
import TagInput from "./TagInput";
import RoomType from "@docspace/shared/components/room-type";
import PermanentSettings from "./PermanentSettings";
import InputParam from "./Params/InputParam";
import ThirdPartyStorage from "./ThirdPartyStorage";
// import IsPrivateParam from "./IsPrivateParam";

import withLoader from "@docspace/client/src/HOCs/withLoader";
import SetRoomParamsLoader from "@docspace/shared/skeletons/create-edit-room/SetRoomParams";

import ItemIcon from "@docspace/client/src/components/ItemIcon";

import ChangeRoomOwner from "./ChangeRoomOwner";
import RoomQuota from "./RoomQuota";
import { RoomsType } from "@docspace/shared/enums";
import { getRoomTypeName } from "SRC_DIR/helpers/filesUtils";
import { isMobile, mobile } from "@docspace/shared/utils";

import debounce from "lodash.debounce";

import { AvatarEditorDialog } from "SRC_DIR/components/dialogs";

import { RoomIcon } from "@docspace/shared/components/room-icon";
import { globalColors } from "@docspace/shared/themes";

const StyledSetRoomParams = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 22px;
  margin-top: 20px;

  .icon-editor_text {
    margin-bottom: 6px;
  }

  .icon-editor {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: start;
    gap: 16px;

    ${(props) =>
      props.disableImageRescaling &&
      css`
        margin-bottom: 24px;
      `};
  }

  .logo-name-container {
    display: flex;
    align-items: end;
    gap: 16px;

    @media ${mobile} {
      flex-direction: column;
      align-items: center;
    }

    .react-svg-icon {
      width: 64px;
      height: 64px;
      @media ${mobile} {
        width: 96px;
        height: 96px;
      }
    }
    .room-title {
      font-size: 32px;
      font-weight: 700;
      line-height: 37px;
      user-select: none;
      @media ${mobile} {
        font-size: 42px;
        line-height: 56px;
      }
    }
  }
`;

const SetRoomParams = ({
  t,
  roomParams,
  setRoomParams,
  setIsOauthWindowOpen,
  setRoomType,
  tagHandler,
  setIsScrollLocked,
  isEdit,
  isDisabled,
  isValidTitle,
  setIsValidTitle,
  isWrongTitle,
  setIsWrongTitle,
  onKeyUp,
  enableThirdParty,
  isDefaultRoomsQuotaSet,
  folderFormValidation,
  disabledChangeRoomType,
  maxImageUploadSize,
  onOwnerChange,
  selection,
  getLogoCoverModel,
  getInfoPanelItemIcon,
  uploadFile,
  avatarEditorDialogVisible,
  setAvatarEditorDialogVisible,
  roomLogoCoverDialogVisible,
  currentColorScheme,
  setRoomCoverDialogProps,
  roomCoverDialogProps,
  image,
  cover,
  covers,
  setCover,
}) => {
  const [previewIcon, setPreviewIcon] = useState(null);
  const [createNewFolderIsChecked, setCreateNewFolderIsChecked] =
    useState(true);
  const [disableImageRescaling, setDisableImageRescaling] = useState(isEdit);

  const [previewTitle, setPreviewTitle] = useState(null);

  const [forceHideRoomTypeDropdown, setForceHideRoomTypeDropdown] =
    useState(false);

  const isFormRoom = roomParams.type === RoomsType.FormRoom;
  const isPublicRoom = roomParams.type === RoomsType.PublicRoom;

  const getCoverLogo = () => {
    if (cover) {
      setPreviewIcon(null);
    }

    if (cover && cover.cover) {
      const currentCoverData = covers.filter(
        (item) => item.id === cover.cover,
      )[0].data;
      return { ...cover, data: currentCoverData };
    }
    return null;
  };

  const currentCover = React.useMemo(getCoverLogo, [cover]);

  const debouncedTitle = React.useCallback(
    debounce((value) => setPreviewTitle(value), 300),
    [],
  );

  const randomColor = React.useMemo(
    () =>
      globalColors.logoColors[
        Math.floor(Math.random() * globalColors.logoColors.length)
      ].replace("#", ""),
    [],
  );

  const currentIcon = selection?.logo?.large
    ? selection?.logo?.large
    : selection?.logo?.cover
      ? selection?.logo
      : getInfoPanelItemIcon(selection, 96);

  const onChangeFile = async (e) => {
    const uploadedFile = await uploadFile(t, e);

    setRoomParams({
      ...roomParams,
      icon: { ...roomParams.icon, uploadedFile: uploadedFile },
      iconWasUpdated: true,
    });

    onChangeIcon({ ...roomParams.icon, uploadedFile: uploadedFile });
  };

  const onChangeName = (e) => {
    setIsValidTitle(true);
    if (e.target.value.match(folderFormValidation)) {
      setIsWrongTitle(true);
      // toastr.warning(t("Files:ContainsSpecCharacter"));
    } else {
      setIsWrongTitle(false);
    }
    if (!isEdit) {
      debouncedTitle(e.target.value);
      setRoomCoverDialogProps({
        ...roomCoverDialogProps,
        title: e.target.value,
      });
    }
    setRoomParams({
      ...roomParams,
      title: e.target.value,
    });

    if (!cover && !previewIcon) {
      setCover(`#${randomColor}`, "");
    }
  };

  const onSaveAvatar = () => {
    setAvatarEditorDialogVisible(false);
    setCover();
  };

  const onChangeIsPrivate = () =>
    setRoomParams({ ...roomParams, isPrivate: !roomParams.isPrivate });

  const onChangeStorageLocation = (storageLocation) =>
    setRoomParams({ ...roomParams, storageLocation });

  const onChangeIcon = (icon) => {
    if (!icon.uploadedFile !== disableImageRescaling)
      setDisableImageRescaling(!icon.uploadedFile);

    setRoomParams({ ...roomParams, icon: icon, iconWasUpdated: true });
  };

  const onCreateFolderChange = () => {
    setCreateNewFolderIsChecked(!createNewFolderIsChecked);
    setRoomParams({
      ...roomParams,
      ...{ createAsNewFolder: !createNewFolderIsChecked },
    });
  };

  const hasImage = isEdit ? selection?.logo?.original : false;
  const model = getLogoCoverModel(t, hasImage);

  const isEmptyIcon = previewTitle
    ? false
    : avatarEditorDialogVisible
      ? true
      : previewIcon
        ? false
        : previewTitle
          ? false
          : true;

  const element = isEdit ? (
    <ItemIcon
      id={selection?.id}
      fileExst={selection?.fileExst}
      isRoom={selection?.isRoom}
      title={selection?.title}
      logo={
        currentCover
          ? { cover: currentCover }
          : avatarEditorDialogVisible
            ? currentIcon
            : previewIcon || currentIcon
      }
      showDefault={
        cover && cover.cover
          ? false
          : (!previewIcon &&
              !selection?.logo?.cover &&
              !selection?.logo?.large) ||
            cover?.color
      }
      color={cover ? cover.color : selection?.logo?.color}
      size={isMobile() ? "96px" : "64px"}
      withEditing={true}
      model={model}
      onChangeFile={onChangeFile}
    />
  ) : (
    <RoomIcon
      id={selection?.id}
      title={previewTitle}
      showDefault={
        cover && cover.cover ? false : !previewIcon || avatarEditorDialogVisible
      }
      size={isMobile() ? "96px" : "64px"}
      imgClassName={"react-svg-icon"}
      model={model}
      isEmptyIcon={(!currentCover || roomLogoCoverDialogVisible) && isEmptyIcon}
      color={cover ? cover.color : randomColor}
      logo={
        currentCover
          ? { cover: currentCover }
          : !avatarEditorDialogVisible && previewIcon
      }
      withEditing={
        (previewIcon && !avatarEditorDialogVisible) ||
        previewTitle ||
        (currentCover && !roomLogoCoverDialogVisible)
      }
      onChangeFile={onChangeFile}
      currentColorScheme={currentColorScheme}
    />
  );

  return (
    <StyledSetRoomParams disableImageRescaling={disableImageRescaling}>
      {isEdit || disabledChangeRoomType ? (
        <RoomType t={t} roomType={roomParams.type} type="displayItem" />
      ) : (
        <RoomTypeDropdown
          t={t}
          currentRoomType={roomParams.type}
          setRoomType={setRoomType}
          setIsScrollLocked={setIsScrollLocked}
          isDisabled={isDisabled}
          forceHideDropdown={forceHideRoomTypeDropdown}
        />
      )}
      <div className="logo-name-container">
        {element}
        <InputParam
          id="shared_room-name"
          title={`${t("Common:Name")}:`}
          placeholder={t("Common:EnterName")}
          value={roomParams.title}
          onChange={onChangeName}
          isDisabled={isDisabled}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          onFocus={() => setForceHideRoomTypeDropdown(true)}
          onBlur={() => setForceHideRoomTypeDropdown(false)}
          errorMessage={
            isWrongTitle
              ? t("Files:ContainsSpecCharacter")
              : t("Common:RequiredField")
          }
          onKeyUp={onKeyUp}
          isAutoFocussed={true}
        />
      </div>

      <TagInput
        t={t}
        tagHandler={tagHandler}
        setIsScrollLocked={setIsScrollLocked}
        isDisabled={isDisabled}
        onFocus={() => setForceHideRoomTypeDropdown(true)}
        onBlur={() => setForceHideRoomTypeDropdown(false)}
      />
      {isEdit && (
        <PermanentSettings
          t={t}
          title={roomParams.title}
          isThirdparty={roomParams.isThirdparty}
          storageLocation={roomParams.storageLocation}
          isPrivate={roomParams.isPrivate}
          isDisabled={isDisabled}
        />
      )}

      {/* //TODO: Uncomment when private rooms are done
      {!isEdit && (
        <IsPrivateParam
          t={t}
          isPrivate={roomParams.isPrivate}
          onChangeIsPrivate={onChangeIsPrivate}
        />
      )} */}

      {isEdit && (
        <ChangeRoomOwner
          roomOwner={roomParams.roomOwner}
          onOwnerChange={onOwnerChange}
        />
      )}

      {isDefaultRoomsQuotaSet && !roomParams.storageLocation.providerKey && (
        <RoomQuota
          setRoomParams={setRoomParams}
          roomParams={roomParams}
          isEdit={isEdit}
          isLoading={isDisabled}
        />
      )}

      {!isEdit && enableThirdParty && isPublicRoom && (
        <ThirdPartyStorage
          t={t}
          roomTitle={roomParams.title}
          storageLocation={roomParams.storageLocation}
          onChangeStorageLocation={onChangeStorageLocation}
          setIsScrollLocked={setIsScrollLocked}
          setIsOauthWindowOpen={setIsOauthWindowOpen}
          isDisabled={isDisabled}
          createNewFolderIsChecked={createNewFolderIsChecked}
          onCreateFolderChange={onCreateFolderChange}
        />
      )}

      <div>
        {avatarEditorDialogVisible && (
          <AvatarEditorDialog
            t={t}
            isDisabled={isDisabled}
            image={roomParams.icon}
            setPreview={setPreviewIcon}
            onChangeImage={onChangeIcon}
            onClose={() => setAvatarEditorDialogVisible(false)}
            onSave={onSaveAvatar}
            onChangeFile={onChangeFile}
            classNameWrapperImageCropper={"icon-editor"}
            disableImageRescaling={disableImageRescaling}
            visible={roomParams.icon.uploadedFile}
            maxImageSize={maxImageUploadSize}
          />
        )}
      </div>
    </StyledSetRoomParams>
  );
};

export default inject(
  ({
    settingsStore,
    dialogsStore,
    currentQuotaStore,
    filesStore,
    infoPanelStore,
    avatarEditorDialogStore,
  }) => {
    const { isDefaultRoomsQuotaSet } = currentQuotaStore;
    const { folderFormValidation, maxImageUploadSize, currentColorScheme } =
      settingsStore;

    const { bufferSelection } = filesStore;
    const { getInfoPanelItemIcon, infoPanelSelection } = infoPanelStore;

    const {
      uploadFile,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      image,
    } = avatarEditorDialogStore;

    const {
      setChangeRoomOwnerIsVisible,
      roomLogoCoverDialogVisible,
      getLogoCoverModel,
      setCoverSelection,
      setRoomCoverDialogProps,
      roomCoverDialogProps,
      cover,
      covers,
      setCover,
    } = dialogsStore;

    const selection =
      bufferSelection != null ? bufferSelection : infoPanelSelection;

    setCoverSelection(selection);

    return {
      isDefaultRoomsQuotaSet,
      folderFormValidation,
      setChangeRoomOwnerIsVisible,
      maxImageUploadSize,
      bufferSelection,
      getLogoCoverModel,
      selection,
      getInfoPanelItemIcon,
      setCoverSelection,
      uploadFile,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      setRoomCoverDialogProps,
      roomCoverDialogProps,
      roomLogoCoverDialogVisible,
      currentColorScheme,
      image,
      cover,
      covers,
      setCover,
    };
  },
)(
  observer(
    withTranslation([
      "CreateEditRoomDialog",
      "Translations",
      "Common",
      "RoomLogoCover",
    ])(withLoader(SetRoomParams)(<SetRoomParamsLoader />)),
  ),
);
