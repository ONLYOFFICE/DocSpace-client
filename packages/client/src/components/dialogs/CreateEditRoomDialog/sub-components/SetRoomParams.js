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

import { ImageEditor } from "@docspace/shared/components/image-editor";
import PreviewTile from "@docspace/shared/components/image-editor/PreviewTile";
import { Text } from "@docspace/shared/components/text";
import VirtualDataRoomBlock from "./VirtualDataRoomBlock";

import ChangeRoomOwner from "./ChangeRoomOwner";
import RoomQuota from "./RoomQuota";
import { RoomsType } from "@docspace/shared/enums";
import { getRoomTypeName } from "SRC_DIR/helpers/filesUtils";

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
  currentColorScheme,
  setChangeRoomOwnerIsVisible,
  folderFormValidation,
  disabledChangeRoomType,
  maxImageUploadSize,
}) => {
  const [previewIcon, setPreviewIcon] = useState(null);
  const [createNewFolderIsChecked, setCreateNewFolderIsChecked] =
    useState(true);
  const [disableImageRescaling, setDisableImageRescaling] = useState(isEdit);

  const [forceHideRoomTypeDropdown, setForceHideRoomTypeDropdown] =
    useState(false);

  const isVDRRoom = roomParams.type === RoomsType.VirtualDataRoom;

  const isFormRoom = roomParams.type === RoomsType.FormRoom;
  const isPublicRoom = roomParams.type === RoomsType.PublicRoom;

  const onChangeName = (e) => {
    setIsValidTitle(true);
    if (e.target.value.match(folderFormValidation)) {
      setIsWrongTitle(true);
      // toastr.warning(t("Files:ContainsSpecCharacter"));
    } else {
      setIsWrongTitle(false);
    }
    setRoomParams({ ...roomParams, title: e.target.value });
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

  const onOwnerChange = () => {
    setChangeRoomOwnerIsVisible(true, true, (roomOwner) =>
      setRoomParams({ ...roomParams, roomOwner }),
    );
  };

  const onCreateFolderChange = () => {
    setCreateNewFolderIsChecked(!createNewFolderIsChecked);
    setRoomParams({
      ...roomParams,
      ...{ createAsNewFolder: !createNewFolderIsChecked },
    });
  };

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

      <TagInput
        t={t}
        tagHandler={tagHandler}
        setIsScrollLocked={setIsScrollLocked}
        isDisabled={isDisabled}
        onFocus={() => setForceHideRoomTypeDropdown(true)}
        onBlur={() => setForceHideRoomTypeDropdown(false)}
      />

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

      {isVDRRoom && (
        <VirtualDataRoomBlock
          t={t}
          roomParams={roomParams}
          setRoomParams={setRoomParams}
          isEdit={isEdit}
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
        <Text fontWeight={600} className="icon-editor_text">
          {t("Icon")}
        </Text>
        <ImageEditor
          t={t}
          isDisabled={isDisabled}
          image={roomParams.icon}
          setPreview={setPreviewIcon}
          onChangeImage={onChangeIcon}
          classNameWrapperImageCropper={"icon-editor"}
          disableImageRescaling={disableImageRescaling}
          maxImageSize={maxImageUploadSize}
          Preview={
            <PreviewTile
              t={t}
              title={roomParams.title || t("Common:NewRoom")}
              previewIcon={previewIcon}
              tags={roomParams.tags.map((tag) => tag.name)}
              isDisabled={isDisabled}
              defaultTagLabel={getRoomTypeName(roomParams.type, t)}
            />
          }
        />
      </div>
    </StyledSetRoomParams>
  );
};

export default inject(({ settingsStore, dialogsStore, currentQuotaStore }) => {
  const { isDefaultRoomsQuotaSet } = currentQuotaStore;

  const { setChangeRoomOwnerIsVisible } = dialogsStore;
  const { folderFormValidation, maxImageUploadSize } = settingsStore;

  return {
    isDefaultRoomsQuotaSet,
    folderFormValidation,
    setChangeRoomOwnerIsVisible,
    maxImageUploadSize,
  };
})(
  observer(
    withTranslation(["CreateEditRoomDialog", "Translations", "Common"])(
      withLoader(SetRoomParams)(<SetRoomParamsLoader />),
    ),
  ),
);
