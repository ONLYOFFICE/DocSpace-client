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
import { makeAutoObservable } from "mobx";
import isEqual from "lodash/isEqual";
import type { TFunction } from "i18next";

import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import type { Nullable } from "@docspace/shared/types";
import {
  addServersForRoom,
  createAIAgent,
  deleteServersForRoom,
  editAIAgent,
  getDefaultProvider,
  getModels,
} from "@docspace/shared/api/ai";
import type {
  TAgent,
  TAgentLogo,
  TChatSettings,
  TCreateAgentData,
  TEditAgentData,
} from "@docspace/shared/api/ai/types";
import type {
  TAgentIconParams,
  TAgentParams,
} from "@docspace/shared/utils/aiAgents";

import type AgentDialogsStore from "./AgentDialogsStore";
import type AvatarEditorStore from "./AvatarEditorStore";
import type AgentLoadingStore from "./AgentLoadingStore";
import type AiRoomStore from "./AiRoomStore";

// Inlined from client/src/helpers/filesUtils.js#calculateRoomLogoParams
const calculateRoomLogoParams = (
  img: HTMLImageElement,
  x: number,
  y: number,
  zoom: number,
) => {
  let imgWidth: number;
  let imgHeight: number;
  let dimensions: number;
  if (img.width > img.height) {
    imgWidth = Math.min(1280, img.width);
    imgHeight = Math.round(img.height / (img.width / imgWidth));
    dimensions = Math.round(imgHeight / zoom);
  } else {
    imgHeight = Math.min(1280, img.height);
    imgWidth = Math.round(img.width / (img.height / imgHeight));
    dimensions = Math.round(imgWidth / zoom);
  }

  const croppedX = Math.round(x * imgWidth - dimensions / 2);
  const croppedY = Math.round(y * imgHeight - dimensions / 2);

  return {
    x: croppedX,
    y: croppedY,
    width: dimensions,
    height: dimensions,
  };
};

type CreateAgentDeps = {
  dialogsStore: AgentDialogsStore;
  avatarEditorStore: AvatarEditorStore;
  loadingStore: AgentLoadingStore;
  aiRoomStore: AiRoomStore;
  // Caller-provided navigation. In SDK we use next/navigation router.push;
  // store stays framework-agnostic by accepting a callback.
  navigateToAgent?: (agent: TAgent, urlPath: string) => void;
  // Whether portal default quota is set (replaces CurrentQuotasStore lookup).
  isDefaultAgentsQuotaSet?: boolean;
  isDefaultRoomsQuotaSet?: boolean;
  // Clear the in-memory model cache used inside the dialog.
  clearModelCache?: () => void;
};

class CreateEditAgentStore {
  agentParams: Nullable<TAgentParams> = null;

  isLoading = false;

  onClose: Nullable<VoidFunction> = null;

  private deps: Nullable<CreateAgentDeps> = null;

  constructor() {
    makeAutoObservable(this, {
      // deps is a non-reactive reference set imperatively at mount time
      deps: false,
    } as Record<string, false>);
  }

  configure = (deps: CreateAgentDeps) => {
    this.deps = deps;
  };

  setAgentParams = (agentParams: TAgentParams) => {
    this.agentParams = agentParams;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  setOnClose = (onClose: Nullable<VoidFunction>) => {
    this.onClose = onClose;
  };

  getLogoParams = (uploadedFile: File, icon: TAgentIconParams) => {
    const img = new Image();
    const url = URL.createObjectURL(uploadedFile);

    return new Promise<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>((resolve, reject) => {
      img.onload = () => {
        URL.revokeObjectURL(url);
        const { x, y, zoom } = icon;
        resolve(calculateRoomLogoParams(img, x, y, zoom));
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  getAgentLogo = async (
    icon: TAgentIconParams,
  ): Promise<TAgentLogo | undefined> => {
    const deps = this.deps;
    if (!deps) return undefined;

    try {
      const [logoParamsData, uploadedData] = await Promise.all([
        this.getLogoParams(icon.uploadedFile as unknown as File, icon),
        deps.avatarEditorStore.getUploadedLogoData(),
      ]);

      return {
        tmpFile: uploadedData.responseData.data,
        ...logoParamsData,
      } as TAgentLogo;
    } catch (err) {
      toastr.error(err as string);
      return undefined;
    }
  };

  onSaveEditAgent = async (
    t: TFunction,
    newParams: TAgentParams,
    agent: TAgent,
  ) => {
    const deps = this.deps;
    if (!deps) return;

    const { dialogsStore, avatarEditorStore } = deps;
    const isDefaultAIAgentsQuotaSet = !!deps.isDefaultAgentsQuotaSet;

    const {
      title,
      icon,
      agentId,
      prompt,
      providerId,
      modelId,
      agentOwner,
      quota,
    } = newParams;

    const quotaLimit = quota ?? agent.quotaLimit;
    const isQuotaChanged = quotaLimit !== agent.quotaLimit;
    const isTitleChanged = !isEqual(title, agent.title);
    const isOwnerChanged =
      agentOwner && agentOwner.id !== agent.createdBy.id;

    const prevTags = [...agent.tags].sort();
    const currTags = newParams.tags.map((p) => p.name).sort();
    const isTagsChanged = !isEqual(prevTags, currTags);

    const tags = newParams.tags.map((tag) => tag.name);

    const editAgentParams: TEditAgentData = {
      ...(isTitleChanged && { title: title || t("Common:NewRoom") }),
      ...(isTagsChanged && { tags }),
      ...(isDefaultAIAgentsQuotaSet &&
        isQuotaChanged && { quota: Number(quotaLimit) }),
      ...(dialogsStore.cover && {
        cover: dialogsStore.cover.cover,
        color: dialogsStore.cover.color,
      }),
      ...((prompt || providerId || modelId) && {
        chatSettings: { prompt } satisfies TChatSettings,
      }),
    };

    const isDeleteLogo = !!agent.logo.original && !icon.uploadedFile;
    dialogsStore.clearCoverProps();

    try {
      if (avatarEditorStore.uploadedFile) {
        const [logoParamsData, uploadedData] = await Promise.all([
          this.getLogoParams(avatarEditorStore.uploadedFile, icon),
          avatarEditorStore.getUploadedLogoData(),
        ]);
        editAgentParams.logo = {
          tmpFile: uploadedData.responseData.data,
          ...logoParamsData,
        } satisfies TAgentLogo;
      }
    } catch (e) {
      toastr.error(e as string);
    }

    try {
      if (Object.keys(editAgentParams).length) {
        await editAIAgent(agent.id, editAgentParams);
      }

      const requests: Promise<unknown>[] = [];

      if (isOwnerChanged) {
        requests.push(api.files.setFileOwner(agentOwner.id, [agent.id]));
      }

      if (isDeleteLogo) {
        requests.push(api.rooms.removeLogoFromRoom(agent.id));
      }

      const { mcpServers, mcpServersInitial } = newParams;
      if (mcpServers && mcpServersInitial) {
        const deletedServers = mcpServersInitial.filter(
          (id) => !mcpServers.includes(id),
        );
        const addedServers = mcpServers.filter(
          (id) => !mcpServersInitial.includes(id),
        );
        if (addedServers.length)
          requests.push(addServersForRoom(agentId!, addedServers));
        if (deletedServers.length)
          requests.push(deleteServersForRoom(agentId!, deletedServers));
      }

      if (requests.length) await Promise.all(requests);
    } catch (e) {
      toastr.error(e as string);
    }
  };

  onCreateAgent = async (
    t: TFunction,
    successToast: React.ReactNode = null,
  ) => {
    const deps = this.deps;
    if (!deps || !this.agentParams) return;

    const { dialogsStore } = deps;
    const isDefaultRoomsQuotaSet = !!deps.isDefaultRoomsQuotaSet;

    const agentParams = this.agentParams;
    const { attachDefaultTools } = agentParams;
    const cover = dialogsStore.cover;

    const { tags, title, icon, logo, prompt, providerId, modelId, quota } =
      agentParams;

    const quotaLimit = isDefaultRoomsQuotaSet ? quota : null;
    const tagsToAddList = tags.map((tag) => tag.name);

    const logoCover = cover
      ? { cover: cover.cover, color: cover.color }
      : logo
        ? {
            cover: (logo as { cover?: { id: string } }).cover?.id,
            color: (logo as { color?: string }).color,
          }
        : null;

    const createAgentData: TCreateAgentData = {
      title: title || t("Common:NewAgent"),
      ...(quotaLimit && { quota: Number(quotaLimit) }),
      ...logoCover,
      ...(tagsToAddList.length && { tags: tagsToAddList }),
      ...((prompt || modelId) && {
        chatSettings: { prompt, modelId } satisfies TChatSettings,
      }),
      ...(typeof attachDefaultTools === "boolean" && { attachDefaultTools }),
    };

    this.setIsLoading(true);

    try {
      // Resolve provider/model when not explicitly set (library profile flow).
      if (!providerId) {
        try {
          const defaultProvider = await getDefaultProvider();
          if (defaultProvider?.providerId) {
            const activeModels = await getModels(defaultProvider.providerId);
            const resolvedModelId = activeModels.some(
              (m) => m.modelId === modelId,
            )
              ? modelId
              : defaultProvider.defaultModel;
            createAgentData.chatSettings = {
              ...(createAgentData.chatSettings as TChatSettings | undefined),
              providerId: defaultProvider.providerId,
              modelId: resolvedModelId,
            };
          }
        } catch {
          /* createAIAgent may still succeed without chatSettings */
        }
      }

      if (icon.uploadedFile && typeof icon.uploadedFile !== "string") {
        const agentLogo = await this.getAgentLogo(icon);
        if (agentLogo) createAgentData.logo = agentLogo;
      }

      const agent = await createAIAgent(createAgentData);
      if ((agent as unknown as { errorMsg?: string }).errorMsg) {
        toastr.error((agent as unknown as { errorMsg: string }).errorMsg);
        return;
      }

      dialogsStore.setIsNewRoomByCurrentUser(true);

      if (agentParams.mcpServers?.length) {
        addServersForRoom(agent.id, agentParams.mcpServers).catch(() => {});
      }

      this.onOpenNewAgent(agent);

      if (successToast) toastr.success(successToast);

      deps.clearModelCache?.();
    } catch (err) {
      toastr.error(err as string);
    } finally {
      this.setIsLoading(false);
      this.onClose?.();
      dialogsStore.clearCoverProps();
    }
  };

  onOpenNewAgent = (agent: TAgent) => {
    const deps = this.deps;
    if (!deps) return;

    deps.loadingStore.setIsSectionBodyLoading(true);

    deps.aiRoomStore.setRoomId(Number(agent.id));
    deps.aiRoomStore.setCurrentTab("chat");

    // SDK has a single /ai-agents page — encode the agent via query params
    // instead of the client's CategoryType-based path.
    const params = new URLSearchParams();
    params.set("roomId", String(agent.id));
    params.set("tab", "chat");
    const urlPath = `/ai-agents?${params.toString()}`;

    deps.navigateToAgent?.(agent, urlPath);
  };
}

const CreateEditAgentStoreContext =
  React.createContext<CreateEditAgentStore | null>(null);

export const CreateEditAgentStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new CreateEditAgentStore(), []);
  return (
    <CreateEditAgentStoreContext.Provider value={store}>
      {children}
    </CreateEditAgentStoreContext.Provider>
  );
};

export const useCreateEditAgentStore = () => {
  const store = React.useContext(CreateEditAgentStoreContext);
  if (!store)
    throw new Error(
      "useCreateEditAgentStore must be used within CreateEditAgentStoreContextProvider",
    );
  return store;
};

export default CreateEditAgentStore;
