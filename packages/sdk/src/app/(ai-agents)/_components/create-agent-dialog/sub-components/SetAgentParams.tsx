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

"use client";

import React, { useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { isMobile, removeEmojiCharacters } from "@docspace/shared/utils";
import type { TLogo } from "@docspace/ui-kit/types";
import type {
  TAgentIconParams,
  TAgentParams,
} from "@docspace/shared/utils/aiAgents";
import type { TAgent } from "@docspace/shared/api/ai/types";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector";

import type TagHandler from "../../../_helpers/TagHandler";
import TagInput from "../../tag-input";
import InputParam from "../../create-edit-dialog-params/InputParam";
import AvatarEditorDialog from "../../avatar-editor-dialog";
import {
  useAgentDialogsStore,
  useAgentsQuotaStore,
  useAvatarEditorStore,
} from "../../../_store";

import RoomQuota from "../../room-quota";
import ChangeRoomOwner from "../../change-room-owner";
import ModelSettings from "./Model";
import InstructionsSettings from "./Instructions";
import MCPSettings from "./MCP";

import styles from "./SetAgentParams.module.scss";

type SetAgentParamsProps = {
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
  onOwnerChange?: () => void;
  portalMcpServerId?: string;
  onClickAction?: () => void;
  selectedServers?: TSelectorItem[];
  setSelectedServers?: React.Dispatch<React.SetStateAction<TSelectorItem[]>>;
  folderFormValidation?: RegExp;
  maxImageUploadSize?: number;
  selection?: TAgent;
};

const SetAgentParams = ({
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
  onOwnerChange,
  portalMcpServerId,
  onClickAction,
  selectedServers,
  setSelectedServers,
  folderFormValidation,
  maxImageUploadSize,
  selection,
}: SetAgentParamsProps) => {
  const { t } = useTranslation(["Common"]);

  const dialogsStore = useAgentDialogsStore();
  const avatarEditorStore = useAvatarEditorStore();
  const quotaStore = useAgentsQuotaStore();

  const { isDefaultAIAgentsQuotaSet, defaultAIAgentsQuota } = quotaStore;

  const {
    cover,
    covers,
    setCover,
    setRoomCoverDialogProps,
    roomCoverDialogProps,
    roomLogoCoverDialogVisible,
    getLogoCoverModel,
  } = dialogsStore;

  const {
    avatarEditorDialogVisible,
    setAvatarEditorDialogVisible,
    uploadFile,
    clearUploadedFile,
  } = avatarEditorStore;

  const [previewIcon, setPreviewIcon] = useState<string | null>(
    agentParams.previewIcon ?? null,
  );
  const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [disableImageRescaling, setDisableImageRescaling] = useState(!!isEdit);
  const [previewTitle, setPreviewTitle] = useState<string>(
    selection?.title ?? "",
  );
  const [createAgentTitle, setCreateAgentTitle] = useState(agentParams.title);

  const originalIconRef = React.useRef({
    icon: agentParams.icon,
    previewIcon: agentParams.previewIcon,
    iconWasUpdated: agentParams.iconWasUpdated,
  });

  const checkWidth = () => {
    setHorizontalOrientation(!isMobile());
  };

  React.useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  React.useEffect(() => {
    if (agentParams.previewIcon !== previewIcon) {
      setAgentParams({ previewIcon });
    }
    // Mirror client deps — sync only when previewIcon changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewIcon, agentParams.previewIcon]);

  const getCoverLogo = () => {
    if (cover) {
      setPreviewIcon(null);
    }

    if (cover && cover.cover) {
      const currentCoverData = covers?.filter(
        (item) => item.id === cover.cover,
      )[0]?.data;

      return { ...cover, data: currentCoverData };
    }

    return null;
  };

  const currentCover = React.useMemo(getCoverLogo, [cover, covers]);

  React.useEffect(() => {
    setRoomCoverDialogProps?.({
      ...roomCoverDialogProps,
      title: previewTitle,
    });
    // Run once on mount — same as client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        : undefined
    : undefined;

  const onChangeIcon = (icon: TAgentIconParams) => {
    if (!icon.uploadedFile !== disableImageRescaling)
      setDisableImageRescaling(!icon.uploadedFile);

    setAgentParams({ icon, iconWasUpdated: true });
  };

  const onChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    originalIconRef.current = {
      icon: agentParams.icon,
      previewIcon: agentParams.previewIcon,
      iconWasUpdated: agentParams.iconWasUpdated,
    };

    const uploadedFile = await uploadFile(t, e);
    if (!uploadedFile) return;

    setAgentParams({
      icon: { ...agentParams.icon, uploadedFile },
      iconWasUpdated: true,
    });

    onChangeIcon({ ...agentParams.icon, uploadedFile });
  };

  const onCloseAvatarEditor = () => {
    setPreviewIcon(originalIconRef.current.previewIcon ?? null);
    setAvatarEditorDialogVisible(false);

    clearUploadedFile();

    setAgentParams({
      icon: originalIconRef.current.icon,
      previewIcon: originalIconRef.current.previewIcon,
      iconWasUpdated: originalIconRef.current.iconWasUpdated,
    });
  };

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsValidTitle(true);
    let newValue = e.target.value;
    newValue = removeEmojiCharacters(newValue);

    if (folderFormValidation && newValue.match(folderFormValidation)) {
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

    setAgentParams({ title: newValue });

    if (!cover && !previewIcon && !isEdit) {
      setCover(`#${randomColor}`, "");
    }
  };

  const onSaveAvatar = () => {
    setAvatarEditorDialogVisible(false);
    setCover();
  };

  const onDeleteAvatar = () => {
    if (previewIcon) setPreviewIcon(null);
    else setCover(`#${randomColor}`, "");

    setAgentParams({
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
        (agentParams.icon.uploadedFile && selection?.logo?.original)
      )
    : false;
  const model = getLogoCoverModel(t, hasImage);

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
      : (!previewIcon && !selection?.logo?.cover && !selection?.logo?.large) ||
        !!cover?.color;

  // Edit mode shows current room icon with editing menu; Create mode shows
  // an empty icon based on the typed title / chosen cover.
  const element = isEdit ? (
    <RoomIcon
      title={previewTitle}
      className="room-params-icon"
      logo={itemIconLogo as unknown as TLogo}
      showDefault={showDefault}
      color={cover ? cover.color : selection?.logo?.color}
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
        (!!previewIcon && !avatarEditorDialogVisible) ||
        !!createAgentTitle ||
        (!!currentCover && !roomLogoCoverDialogVisible) ||
        !!cover?.color
      }
      onChangeFile={onChangeFile}
      dataTestId="create_edit_agent_icon"
    />
  );

  return (
    <div
      className={`${styles.setAgentParams}${disableImageRescaling ? ` ${styles.disableImageRescaling}` : ""}`}
    >
      <div className={styles.logoNameContainer}>
        {element}

        <InputParam
          id="shared_agent-name"
          title={`${t("Common:AgentName")}:`}
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
        tagHandler={tagHandler}
        setIsScrollLocked={setIsScrollLocked}
        isDisabled={isDisabled}
        dataTestId="create_edit_agent_tags_input"
      />

      {isEdit && agentParams.agentOwner ? (
        <ChangeRoomOwner
          canChangeOwner={!!agentParams.canChangeAgentOwner}
          roomOwner={agentParams.agentOwner}
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

      <MCPSettings
        agentParams={agentParams}
        setAgentParams={setAgentParams}
        portalMcpServerId={portalMcpServerId}
        onClickAction={onClickAction}
        selectedServers={selectedServers}
        setSelectedServers={setSelectedServers}
      />

      {isDefaultAIAgentsQuotaSet ? (
        <RoomQuota
          setRoomParams={setAgentParams}
          roomParams={agentParams}
          defaultQuota={defaultAIAgentsQuota}
          isEdit={isEdit}
          isLoading={isDisabled}
          isAgent
        />
      ) : null}

      {avatarEditorDialogVisible ? (
        <AvatarEditorDialog
          isDisabled={isDisabled}
          image={
            {
              ...agentParams.icon,
              uploadedFile: agentParams.icon.uploadedFile ?? undefined,
            } as unknown as Parameters<typeof AvatarEditorDialog>[0]["image"]
          }
          setPreview={(p: string) => setPreviewIcon(p)}
          onChangeImage={(img) =>
            onChangeIcon(img as unknown as TAgentIconParams)
          }
          onClose={onCloseAvatarEditor}
          onSave={onSaveAvatar}
          onChangeFile={onChangeFile}
          classNameWrapperImageCropper="icon-editor"
          disableImageRescaling={disableImageRescaling}
          visible={!!agentParams.icon.uploadedFile}
          maxImageSize={maxImageUploadSize}
          dataTestId="create_edit_agent_avatar_editor"
        />
      ) : null}
    </div>
  );
};

export default observer(SetAgentParams);
