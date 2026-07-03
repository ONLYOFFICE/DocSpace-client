/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { isMobile } from "@docspace/shared/utils";
import styles from "../CreateEditAgentDialog.module.scss";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";

import { removeEmojiCharacters } from "@docspace/shared/utils";
import TagHandler from "SRC_DIR/helpers/TagHandler";

import ItemIcon from "../../../ItemIcon";
import AvatarEditorDialog from "../../AvatarEditorDialog";
import TagInput from "../../../TagInput";
import InputParam from "../../../CreateEditDialogParams/InputParam";

import ProfileSettings from "../sub-components/Profile";
import InstructionsSettings from "../sub-components/Instructions";
import MCPSettings from "../sub-components/MCP";
import {
  TAgentIconParams,
  TAgentParams,
} from "@docspace/shared/utils/aiAgents";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { Nullable } from "@docspace/shared/types";
import { TAgent, TAIConfig } from "@docspace/shared/api/ai/types";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import AvatarEditorDialogStore from "SRC_DIR/store/AvatarEditorDialogStore";
import CreateEditAgentStore from "SRC_DIR/store/CreateEditAgentStore";
import { AgentDialogContext } from "SRC_DIR/helpers/enums";
import { TLogo } from "@docspace/ui-kit/types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import ChangeRoomOwner from "SRC_DIR/components/ChangeRoomOwner";
import RoomQuota from "SRC_DIR/components/RoomQuota";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import type { TRoom } from "@docspace/shared//api/rooms/types";

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
  portalMcpServerId?: string;
  onClickAction?: () => void;
  selectedServers?: TSelectorItem[];
  setSelectedServers?: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;

  // Store props
  folderFormValidation?: SettingsStore["folderFormValidation"];
  maxImageUploadSize?: SettingsStore["maxImageUploadSize"];
  selection?: TAgent;
  getLogoCoverModel?: DialogsStore["getLogoCoverModel"];
  getInfoPanelItemIcon?: InfoPanelStore["getInfoPanelItemIcon"];
  uploadFile?: AvatarEditorDialogStore["uploadFile"];
  clearUploadedFile?: AvatarEditorDialogStore["clearUploadedFile"];
  avatarEditorDialogVisible?: AvatarEditorDialogStore["avatarEditorDialogVisible"];
  setAvatarEditorDialogVisible?: AvatarEditorDialogStore["setAvatarEditorDialogVisible"];
  roomLogoCoverDialogVisible?: DialogsStore["roomLogoCoverDialogVisible"];
  setRoomCoverDialogProps?: DialogsStore["setRoomCoverDialogProps"];
  roomCoverDialogProps?: DialogsStore["roomCoverDialogProps"];
  cover?: Nullable<TClientCover>;
  covers?: Nullable<TServerCover[]>;
  setCover?: DialogsStore["setCover"];
  isDefaultAIAgentsQuotaSet?: CurrentQuotasStore["isDefaultAIAgentsQuotaSet"];
  infoPanelSelection?: TRoom;
  systemAiEnabled?: TAIConfig["systemAiEnabled"];
  recommendedModelForForms?: TAIConfig["recommendedModelForForms"];
  isUserAdmin?: boolean;
  openContext?: CreateEditAgentStore["openContext"];
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
  clearUploadedFile,
  avatarEditorDialogVisible,
  setAvatarEditorDialogVisible,
  roomLogoCoverDialogVisible,
  setRoomCoverDialogProps,
  roomCoverDialogProps,
  cover,
  covers,
  setCover,
  onOwnerChange,
  isDefaultAIAgentsQuotaSet,
  infoPanelSelection,
  portalMcpServerId,
  onClickAction,
  selectedServers,
  setSelectedServers,
  systemAiEnabled,
  recommendedModelForForms,
  isUserAdmin,
  openContext,
}: setAgentParamsProps) => {
  const { t } = useTranslation([
    "CreateEditRoomDialog",
    "Translations",
    "Common",
  ]);

  const [previewIcon, setPreviewIcon] = useState(agentParams.previewIcon);
  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [disableImageRescaling, setDisableImageRescaling] = useState(isEdit);
  const [previewTitle, setPreviewTitle] = useState(
    selection?.title || infoPanelSelection?.title || "",
  );
  const [createAgentTitle, setCreateAgentTitle] = useState(agentParams.title);

  const originalIconRef = React.useRef({
    icon: agentParams.icon,
    previewIcon: agentParams.previewIcon,
    iconWasUpdated: agentParams.iconWasUpdated,
  });

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
      // FABLE5-REVIEW: type-only assertion — the prop is always injected
      // alongside setRoomCoverDialogProps; the original .js spread it as-is.
      ...roomCoverDialogProps!,
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
    originalIconRef.current = {
      icon: agentParams.icon,
      previewIcon: agentParams.previewIcon,
      iconWasUpdated: agentParams.iconWasUpdated,
    };

    const uploadedFile = (await uploadFile?.(t, e)) as File | null;

    setAgentParams({
      ...agentParams,
      icon: { ...agentParams.icon, uploadedFile },
      iconWasUpdated: true,
    });

    onChangeIcon({ ...agentParams.icon, uploadedFile });
  };

  const onCloseAvatarEditor = () => {
    setPreviewIcon(originalIconRef.current.previewIcon);
    setAvatarEditorDialogVisible?.(false);

    clearUploadedFile?.();

    setAgentParams({
      ...agentParams,
      icon: originalIconRef.current.icon,
      previewIcon: originalIconRef.current.previewIcon,
      iconWasUpdated: originalIconRef.current.iconWasUpdated,
    });
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
      // FABLE5-REVIEW: type-only assertion — the prop is always injected
      // alongside setRoomCoverDialogProps; the original .js spread it as-is.
      ...roomCoverDialogProps!,
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
    <div
      className={`${styles.setAgentParams}${disableImageRescaling ? ` ${styles.disableImageRescaling}` : ""}`}
    >
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

      <ProfileSettings
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
        onClickAction={onClickAction}
        selectedServers={selectedServers}
        setSelectedServers={setSelectedServers}
      />

      {isDefaultAIAgentsQuotaSet ? (
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
            onClose={onCloseAvatarEditor}
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
    </div>
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
    userStore,
    createEditAgentStore,
  }: TStore) => {
    const { isDefaultAIAgentsQuotaSet } = currentQuotaStore;
    const { openContext } = createEditAgentStore;
    const { folderFormValidation, maxImageUploadSize, aiConfig } =
      settingsStore;

    const { bufferSelection } = filesStore;
    const { getInfoPanelItemIcon, infoPanelSelection } = infoPanelStore;

    const {
      uploadFile,
      clearUploadedFile,
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
      clearUploadedFile,
      avatarEditorDialogVisible,
      setAvatarEditorDialogVisible,
      setRoomCoverDialogProps,
      roomCoverDialogProps,
      roomLogoCoverDialogVisible,
      cover,
      covers,
      setCover,
      isDefaultAIAgentsQuotaSet,
      infoPanelSelection,

      systemAiEnabled: aiConfig?.systemAiEnabled,
      recommendedModelForForms: aiConfig?.recommendedModelForForms,
      isUserAdmin:
        !!userStore?.user && (userStore.user.isOwner || userStore.user.isAdmin),
      openContext,
    };
  },
)(observer(setAgentParams));

