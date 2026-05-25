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

import React from "react";
import type { TFunction } from "i18next";
import { makeAutoObservable } from "mobx";

import type { TAgent } from "@docspace/shared/api/ai/types";
import type { Nullable } from "@docspace/shared/types";
import {
  getRoomCovers,
  setRoomCover,
  removeLogoFromRoom,
} from "@docspace/shared/api/rooms";
import { ROOM_ACTION_KEYS } from "@docspace/shared/constants";

import TrashIconSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import PenSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import UploadSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";

export type AgentCover = { cover: string; color: string } | null;

export type TServerCover = { id: string; data: string };

export type RoomCoverDialogProps = {
  icon?: Nullable<string>;
  color?: Nullable<string>;
  title?: Nullable<string>;
  withoutIcon?: boolean;
  withSelection?: boolean;
  customColor?: Nullable<string>;
};

export type LogoCoverMenuItem = {
  label: string;
  icon: string;
  key: string;
  onClick: ((ref?: React.RefObject<HTMLInputElement | null>) => void) | (() => void);
};

const defaultCoverDialogProps: RoomCoverDialogProps = {
  icon: null,
  color: null,
  title: null,
  withoutIcon: true,
  withSelection: true,
  customColor: null,
};

class AgentDialogsStore {
  createAgentDialogVisible = false;

  editAgentDialogVisible = false;

  aiAgentsDialogVisible = false;

  // Knowledge "Upload from {{productName}}" picker. Mirrors client's
  // `dialogsStore.selectFileAiKnowledgeDialogVisible` — drives a
  // <FilesSelector> dialog whose `onSelectFile` copies the picked files
  // into the agent's knowledge folder via `copyToFolder`.
  selectFileAiKnowledgeDialogVisible = false;

  editingAgent: Nullable<TAgent> = null;

  deleteAgentDialogState: { visible: boolean; agent: Nullable<TAgent> } = {
    visible: false,
    agent: null,
  };

  leaveAgentDialogState: {
    visible: boolean;
    agent: Nullable<TAgent>;
    isOwner: boolean;
  } = { visible: false, agent: null, isOwner: false };

  // Mirrors client `DialogsStore.invitePanelOptions`. `roomId` is the agent
  // id; `defaultAccess` is the ShareAccessRights-level the new members get
  // (undefined → server-side default). `hideSelector=true` hides the role
  // picker step (unused in SDK so far).
  invitePanelOptions: {
    visible: boolean;
    roomId: Nullable<TAgent["id"]>;
    hideSelector: boolean;
    defaultAccess: number | undefined;
  } = {
    visible: false,
    roomId: null,
    hideSelector: false,
    defaultAccess: undefined,
  };

  // Cover model — ports client DialogsStore cover/covers/setCover bag, used
  // by the agent create/edit dialog to render the cover picker.
  cover: AgentCover = null;

  covers: Nullable<TServerCover[]> = null;

  roomLogoCoverDialogVisible = false;

  roomCoverDialogProps: RoomCoverDialogProps = { ...defaultCoverDialogProps };

  coverSelection: Nullable<TAgent> = null;

  isNewRoomByCurrentUser = false;

  constructor() {
    makeAutoObservable(this);
  }

  setCreateAgentDialogVisible = (visible: boolean) => {
    this.createAgentDialogVisible = visible;
  };

  setEditAgentDialogVisible = (visible: boolean, agent: TAgent | null = null) => {
    this.editAgentDialogVisible = visible;
    this.editingAgent = agent;
  };

  setAiAgentsDialogVisible = (visible: boolean) => {
    this.aiAgentsDialogVisible = visible;
  };

  setSelectFileAiKnowledgeDialogVisible = (visible: boolean) => {
    this.selectFileAiKnowledgeDialogVisible = visible;
  };

  setDeleteAgentDialogVisible = (
    visible: boolean,
    agent: TAgent | null = null,
  ) => {
    this.deleteAgentDialogState = { visible, agent };
  };

  setLeaveAgentDialogVisible = (
    visible: boolean,
    agent: TAgent | null = null,
    isOwner: boolean = false,
  ) => {
    this.leaveAgentDialogState = { visible, agent, isOwner };
  };

  setInvitePanelOptions = (options: {
    visible: boolean;
    roomId?: Nullable<TAgent["id"]>;
    hideSelector?: boolean;
    defaultAccess?: number;
  }) => {
    this.invitePanelOptions = {
      visible: options.visible,
      roomId: options.roomId ?? null,
      hideSelector: options.hideSelector ?? false,
      defaultAccess: options.defaultAccess,
    };
  };

  setIsNewRoomByCurrentUser = (value: boolean) => {
    this.isNewRoomByCurrentUser = value;
  };

  setCovers = (covers: Nullable<TServerCover[]>) => {
    this.covers = covers;
  };

  setRoomLogoCoverDialogVisible = (visible: boolean) => {
    this.roomLogoCoverDialogVisible = visible;
  };

  setRoomCoverDialogProps = (props: RoomCoverDialogProps) => {
    this.roomCoverDialogProps = props;
  };

  clearCoverProps = () => {
    this.cover = null;
    this.setRoomCoverDialogProps({ ...defaultCoverDialogProps });
  };

  setCover = (color?: string, icon?: { id?: string } | string) => {
    if (!color) {
      this.cover = null;
      return;
    }

    const newColor = color.replace("#", "");
    const newIcon = typeof icon === "string" ? "" : (icon?.id ?? "");
    this.cover = { color: newColor, cover: newIcon };

    this.setRoomCoverDialogProps({
      ...this.roomCoverDialogProps,
      icon: null,
      color: null,
      withoutIcon: true,
    });
  };

  setCoverSelection = (selection: Nullable<TAgent>) => {
    this.coverSelection = selection;
  };

  setRoomLogoCover = async (roomId?: TAgent["id"]) => {
    const id = roomId ?? this.coverSelection?.id;
    if (!id) return;

    await setRoomCover(id, this.cover);

    this.setRoomCoverDialogProps({
      ...this.roomCoverDialogProps,
      withSelection: true,
    });
    this.setCover();
  };

  deleteRoomLogo = async () => {
    if (!this.coverSelection) return;
    await removeLogoFromRoom(this.coverSelection.id);
  };

  getLogoCoverModel = (
    t: TFunction,
    hasImage: boolean,
    onDelete?: () => () => void,
  ): LogoCoverMenuItem[] => {
    return [
      {
        label: t("Common:UploadPicture", {
          defaultValue: "Upload picture",
        }),
        icon: UploadSvgUrl,
        key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_UPLOAD,
        onClick: (ref?: React.RefObject<HTMLInputElement | null>) =>
          ref?.current?.click(),
      },
      hasImage
        ? {
            label: t("Common:Delete", { defaultValue: "Delete" }),
            icon: TrashIconSvgUrl,
            key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_DELETE,
            onClick: onDelete ? onDelete() : () => this.deleteRoomLogo(),
          }
        : {
            label: t("Common:CustomizeCover", {
              defaultValue: "Customize cover",
            }),
            icon: PenSvgUrl,
            key: ROOM_ACTION_KEYS.CREATE_EDIT_ROOM_CUSTOMIZE_COVER,
            onClick: () => this.setRoomLogoCoverDialogVisible(true),
          },
    ];
  };

  getCovers = async () => {
    const response = await getRoomCovers();
    this.setCovers(response as TServerCover[]);
  };
}

const AgentDialogsStoreContext =
  React.createContext<AgentDialogsStore | null>(null);

export const AgentDialogsStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new AgentDialogsStore(), []);
  return (
    <AgentDialogsStoreContext.Provider value={store}>
      {children}
    </AgentDialogsStoreContext.Provider>
  );
};

export const useAgentDialogsStore = () => {
  const store = React.useContext(AgentDialogsStoreContext);
  if (!store)
    throw new Error(
      "useAgentDialogsStore must be used within AgentDialogsStoreContextProvider",
    );
  return store;
};

export default AgentDialogsStore;
