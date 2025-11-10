// (c) Copyright Ascensio System SIA 2009-2025
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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { globalColors } from "@docspace/shared/themes";
import { isMobile, mobile } from "@docspace/shared/utils";

import { RoomIcon } from "@docspace/shared/components/room-icon";

import { removeEmojiCharacters } from "SRC_DIR/helpers/utils";
import TagHandler from "SRC_DIR/helpers/TagHandler";

import ItemIcon from "../../../ItemIcon";
import AvatarEditorDialog from "../../AvatarEditorDialog";
import TagInput from "../../../TagInput";
import InputParam from "../../../CreateEditDialogParams/InputParam";

import ModelSettings from "../sub-components/Model";
import InstructionsSettings from "../sub-components/Instructions";
import MCPSettings from "../sub-components/MCP";
import {
  TAgentIconParams,
  TAgentParams,
} from "@docspace/shared/utils/aiAgents";
import { Nullable } from "@docspace/shared/types";
import { TAgent } from "@docspace/shared/api/ai/types";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import AvatarEditorDialogStore from "SRC_DIR/store/AvatarEditorDialogStore";
import { TLogo } from "@docspace/shared/api/rooms/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import ChangeRoomOwner from "SRC_DIR/components/ChangeRoomOwner";
import RoomQuota from "SRC_DIR/components/RoomQuota";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import type { TRoom } from "@docspace/shared/api/rooms/types";

const StyledSetAgentParams = styled.div<{ disableImageRescaling?: boolean }>`
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

    .room-params-icon,
    .react-svg-icon {
      min-width: 64px;
      min-height: 64px;
      @media ${mobile} {
        min-width: 96px;
        min-height: 96px;
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

type TServerCover = {
  id: string;
  data: string;
};

type TClientCover = {
  color: string;
  cover: string;
};

type setAgentParamsProps = {
  agentParams: TAgentParams;
  setAgentParams: (value: Partial<TAgentParams>) => void;
  tagHandler: TagHandler;
  setIsScrollLocked: (value: boolean) => void;
  isEdit?: boolean;
  isDisabled: boolean;
  isValidTitle: boolean;
  setIsValidTitle: (value: boolean) => void;
  isWrongTitle: boolean;
  setIsWrongTitle: (value: boolean) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onOwnerChange?: VoidFunction;
  onOpenMCPSelector?: VoidFunction;
  portalMcpServerId?: string;

  // Store props
  folderFormValidation?: SettingsStore["folderFormValidation"];
  maxImageUploadSize?: SettingsStore["maxImageUploadSize"];
  selection?: TAgent;
  getLogoCoverModel?: DialogsStore["getLogoCoverModel"];
  getInfoPanelItemIcon?: InfoPanelStore["getInfoPanelItemIcon"];
  uploadFile?: AvatarEditorDialogStore["uploadFile"];
  avatarEditorDialogVisible?: AvatarEditorDialogStore["avatarEditorDialogVisible"];
  setAvatarEditorDialogVisible?: AvatarEditorDialogStore["setAvatarEditorDialogVisible"];
  roomLogoCoverDialogVisible?: DialogsStore["roomLogoCoverDialogVisible"];
  setRoomCoverDialogProps?: DialogsStore["setRoomCoverDialogProps"];
  roomCoverDialogProps?: DialogsStore["roomCoverDialogProps"];
  cover?: Nullable<TClientCover>;
  covers?: Nullable<TServerCover[]>;
  setCover?: DialogsStore["setCover"];
  isDefaultAgentsQuotaSet?: CurrentQuotasStore["isDefaultRoomsQuotaSet"];
  infoPanelSelection?: TRoom;
};

const setAgentParams = ({
  agentParams,
  setAgentParams,
  tagHandler,
  setIsScrollLocked,
  isEdit,
  isDisabled,
  isValidTitle,
  setIsValidTitle,
  isWrongTitle,
  setIsWrongTitle,
  onKeyUp,
  folderFormValidation,
  maxImageUploadSize,
  selection,
  getLogoCoverModel,
  getInfoPanelItemIcon,
  uploadFile,
  avatarEditorDialogVisible,
  setAvatarEditorDialogVisible,
  roomLogoCoverDialogVisible,
  setRoomCoverDialogProps,
  roomCoverDialogProps,
  cover,
  covers,
  setCover,
  onOwnerChange,
  onOpenMCPSelector,
  isDefaultAgentsQuotaSet,
  infoPanelSelection,
  portalMcpServerId,
}: setAgentParamsProps) => {
  const { t } = useTranslation([
    "CreateEditRoomDialog",
    "Translations",
    "Common",
    "RoomLogoCover",
  ]);

  const [previewIcon, setPreviewIcon] = useState(agentParams.previewIcon);
  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [disableImageRescaling, setDisableImageRescaling] = useState(isEdit);
  const [previewTitle, setPreviewTitle] = useState(
    selection?.title || infoPanelSelection?.title || "",
  );
  const [createAgentTitle, setCreateAgentTitle] = useState(agentParams.title);

  const checkWidth = () => {
    if (!isMobile()) {
      setHorizontalOrientation(true);
    } else {
      setHorizontalOrientation(false);
    }
  };

  React.useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  React.useEffect(() => {
    if (agentParams.previewIcon !== previewIcon) {
      setAgentParams({
        ...agentParams,
        previewIcon,
      });
    }
  }, [previewIcon, agentParams.previewIcon]);

  const getCoverLogo = () => {
    if (cover) {
      setPreviewIcon(null);
    }

    if (cover && cover.cover) {
      const currentCoverData = covers?.filter(
        (item) => item.id === cover.cover,
      )[0].data;

      return { ...cover, data: currentCoverData };
    }

    return null;
  };

  const currentCover = React.useMemo(getCoverLogo, [cover]);

  React.useEffect(() => {
    setRoomCoverDialogProps?.({
      ...roomCoverDialogProps,
      title: previewTitle,
    });
  }, []);

  const randomColor = React.useMemo(
    () =>
      globalColors.logoColors[
        Math.floor(Math.random() * globalColors.logoColors.length)
      ].replace("#", ""),
    [],
  );

  const currentIcon = selection
    ? selection?.logo?.large
      ? selection?.logo?.large
      : selection?.logo?.cover
        ? selection?.logo
        : getInfoPanelItemIcon?.(selection, 96)
    : infoPanelSelection
      ? infoPanelSelection?.logo?.large
        ? infoPanelSelection?.logo?.large
        : infoPanelSelection?.logo?.cover
          ? infoPanelSelection?.logo
          : getInfoPanelItemIcon?.(infoPanelSelection, 96)
      : undefined;

  const onChangeIcon = (icon: TAgentIconParams) => {
    if (!icon.uploadedFile !== disableImageRescaling)
      setDisableImageRescaling(!icon.uploadedFile);

    setAgentParams({ ...agentParams, icon, iconWasUpdated: true });
  };

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = await uploadFile?.(t, e);

    setAgentParams({
      ...agentParams,
      icon: { ...agentParams.icon, uploadedFile },
      iconWasUpdated: true,
    });

    onChangeIcon({ ...agentParams.icon, uploadedFile });
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidTitle(true);
    let newValue = e.target.value;

    newValue = removeEmojiCharacters(newValue);

    if (newValue.match(folderFormValidation!)) {
      setIsWrongTitle(true);
    } else {
      setIsWrongTitle(false);
    }

    if (isEdit) {
      setPreviewTitle(newValue);
    } else {
      setCreateAgentTitle(newValue);
    }

    setRoomCoverDialogProps?.({
      ...roomCoverDialogProps,
      title: newValue,
    });

    setAgentParams({
      ...agentParams,
      title: newValue,
    });

    if (!cover && !previewIcon && !isEdit) {
      setCover?.(`#${randomColor}`, "");
    }
  };

  const onSaveAvatar = () => {
    setAvatarEditorDialogVisible?.(false);
    setCover?.();
  };

  const onDeleteAvatar = () => {
    if (previewIcon) setPreviewIcon(null);
    else setCover?.(`#${randomColor}`, "");

    setAgentParams({
      ...agentParams,
      icon: {
        uploadedFile: null,
        tmpFile: "",
        x: 0.5,
        y: 0.5,
        zoom: 1,
      },
      iconWasUpdated: false,
    });
  };

  const hasImage = isEdit
    ? !!(
        agentParams.iconWasUpdated ||
        (agentParams.icon.uploadedFile &&
          (selection?.logo?.original || infoPanelSelection?.logo?.original))
      )
    : false;
  const model = getLogoCoverModel?.(t, hasImage);

  const isEditRoomModel = model?.map((item) =>
    item.key === "create_edit_room_delete"
      ? { ...item, onClick: onDeleteAvatar }
      : item,
  );

  const isEmptyIcon =
    createAgentTitle || cover?.color
      ? false
      : avatarEditorDialogVisible
        ? true
        : previewIcon
          ? false
          : !createAgentTitle;

  const roomIconLogo = currentCover
    ? { cover: currentCover }
    : !avatarEditorDialogVisible && previewIcon;

  const itemIconLogo = currentCover
    ? { cover: currentCover }
    : avatarEditorDialogVisible
      ? currentIcon
      : previewIcon || currentIcon;

  const showDefault =
    cover && cover.cover
      ? false
      : (!previewIcon &&
          !selection?.logo?.cover &&
          !selection?.logo?.large &&
          !infoPanelSelection?.logo?.cover &&
          !infoPanelSelection?.logo?.large) ||
        !!cover?.color;

  const element = isEdit ? (
    <ItemIcon
      isRoom
      title={previewTitle}
      className="room-params-icon"
      logo={itemIconLogo as unknown as TLogo}
      showDefault={showDefault}
      color={
        cover
          ? cover.color
          : selection?.logo?.color || infoPanelSelection?.logo?.color
      }
      size={isMobile() && !horizontalOrientation ? "96px" : "64px"}
      radius={isMobile() && !horizontalOrientation ? "18px" : "12px"}
      withEditing
      model={isEditRoomModel}
      onChangeFile={onChangeFile}
      dataTestId="create_edit_agent_icon"
    />
  ) : (
    <RoomIcon
      title={createAgentTitle}
      showDefault={
        cover && cover.cover ? false : !previewIcon || avatarEditorDialogVisible
      }
      size={isMobile() && !horizontalOrientation ? "96px" : "64px"}
      radius={isMobile() && !horizontalOrientation ? "18px" : "12px"}
      imgClassName="react-svg-icon"
      model={model}
      className="room-params-icon"
      isEmptyIcon={
        !currentCover || roomLogoCoverDialogVisible ? isEmptyIcon : false
      }
      color={cover ? cover.color : randomColor}
      logo={roomIconLogo as unknown as TLogo}
      withEditing={
        (previewIcon && !avatarEditorDialogVisible) ||
        !!createAgentTitle ||
        (currentCover && !roomLogoCoverDialogVisible) ||
        !!cover?.color
      }
      onChangeFile={onChangeFile}
      dataTestId="create_edit_agent_icon"
    />
  );

  const tagsTitle = "";

  const inputTitle = `${t("Common:AgentName")}:`;

  return (
    <StyledSetAgentParams disableImageRescaling={disableImageRescaling}>
      <div className="logo-name-container">
        {element}
        <InputParam
          id="shared_agent-name"
          title={inputTitle}
          placeholder={t("Common:EnterName")}
          value={agentParams.title}
          onChange={onChangeName}
          isDisabled={isDisabled}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          errorMessage={
            isWrongTitle
              ? t("Common:ContainsSpecCharacter")
              : t("Common:RequiredField")
          }
          onKeyUp={onKeyUp}
          isAutoFocussed
          dataTestId="create_edit_agent_input"
        />
      </div>

      <TagInput
        t={t}
        title={tagsTitle}
        tagHandler={tagHandler}
        setIsScrollLocked={setIsScrollLocked}
        isDisabled={isDisabled}
        dataTestId="create_edit_agent_tags_input"
      />

      {isEdit ? (
        <ChangeRoomOwner
          canChangeOwner={agentParams.canChangeAgentOwner!}
          roomOwner={agentParams.agentOwner!}
          onOwnerChange={onOwnerChange}
          isAgent
        />
      ) : null}

      <ModelSettings
        agentParams={agentParams}
        setAgentParams={setAgentParams}
      />
      <InstructionsSettings
        agentParams={agentParams}
        setAgentParams={setAgentParams}
      />
      {/* <KnowledgeSettings /> */}
      <MCPSettings
        setAgentParams={setAgentParams}
        agentParams={agentParams}
        portalMcpServerId={portalMcpServerId}
        onOpenMCPSelector={onOpenMCPSelector}
      />

      {isDefaultAgentsQuotaSet ? (
        <RoomQuota
          setRoomParams={setAgentParams}
          roomParams={agentParams}
          isEdit={isEdit}
          isLoading={isDisabled}
          isAgent
        />
      ) : null}

      <div>
        {avatarEditorDialogVisible ? (
          <AvatarEditorDialog
            t={t}
            isDisabled={isDisabled}
            image={agentParams.icon}
            setPreview={setPreviewIcon}
            onChangeImage={onChangeIcon}
            onClose={() => setAvatarEditorDialogVisible?.(false)}
            onSave={onSaveAvatar}
            onChangeFile={onChangeFile}
            classNameWrapperImageCropper="icon-editor"
            disableImageRescaling={disableImageRescaling}
            visible={agentParams.icon.uploadedFile}
            maxImageSize={maxImageUploadSize}
            dataTestId="create_edit_agent_avatar_editor"
          />
        ) : null}
      </div>
    </StyledSetAgentParams>
  );
};

export default inject(
  ({
    settingsStore,
    dialogsStore,
    filesStore,
    infoPanelStore,
    avatarEditorDialogStore,
    currentQuotaStore,
  }: TStore) => {
    const { isDefaultRoomsQuotaSet } = currentQuotaStore;
    const { folderFormValidation, maxImageUploadSize } = settingsStore;

    const { bufferSelection } = filesStore;
    const { getInfoPanelItemIcon, infoPanelSelection } = infoPanelStore;

    const {
      uploadFile,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
    } = avatarEditorDialogStore;

    const {
      roomLogoCoverDialogVisible,
      getLogoCoverModel,
      setCoverSelection,
      setRoomCoverDialogProps,
      roomCoverDialogProps,
      cover,
      covers,
      setCover,
    } = dialogsStore;

    setCoverSelection(bufferSelection);

    return {
      folderFormValidation,
      maxImageUploadSize,
      getLogoCoverModel,
      selection: bufferSelection,
      getInfoPanelItemIcon,
      uploadFile,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      setRoomCoverDialogProps,
      roomCoverDialogProps,
      roomLogoCoverDialogVisible,
      cover,
      covers,
      setCover,
      isDefaultAgentsQuotaSet: isDefaultRoomsQuotaSet,
      infoPanelSelection,
    };
  },
)(observer(setAgentParams));
