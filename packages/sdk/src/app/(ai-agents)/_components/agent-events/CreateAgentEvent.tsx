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

import { useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useApi, useStores } from "@docspace/ui-kit/ai-agent/providers";

import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

import {
  useCreateEditAgentStore,
  useAgentDialogsStore,
  useAgentTagsStore,
  useAgentsQuotaStore,
} from "../../_store";
import CreateAgentDialog from "../create-agent-dialog";

type Props = {
  title: string;
  visible: boolean;
  onClose: VoidFunction;
  portalMcpServerId?: string;
  folderFormValidation?: RegExp;
  maxImageUploadSize?: number;
};

const CreateAgentEvent = ({
  title,
  visible,
  onClose,
  portalMcpServerId = "",
  folderFormValidation,
  maxImageUploadSize,
}: Props) => {
  const { t } = useTranslation(["Common"]);

  const createEditAgentStore = useCreateEditAgentStore();
  const dialogsStore = useAgentDialogsStore();
  const tagsStore = useAgentTagsStore();
  const quotaStore = useAgentsQuotaStore();

  const { useProfilesStore, useThreadsStore } = useStores();
  const api = useApi();
  const profiles = useProfilesStore((s) => s.profiles);
  const insertThread = useThreadsStore((s) => s.insertThread);

  const onCreate = async (agentParams: TAgentParams) => {
    const baseProfile = agentParams.profileId
      ? profiles.find((p) => p.id === agentParams.profileId)
      : profiles.find((p) => p.modelId === agentParams.modelId);

    const threadTitle = agentParams.title || t("Common:NewAgent");

    // Create the agent first — only spin up the thread on success so a
    // failed agent create can't leave an orphan thread behind.
    createEditAgentStore.setAgentParams({
      ...agentParams,
      logo: agentParams.logo,
    });
    createEditAgentStore.setOnClose(onClose);
    const createdAgent = await createEditAgentStore.onCreateAgent(t);

    // Skip thread creation if agent creation failed — otherwise we leave an
    // orphan thread pointing to nothing.
    if (!createdAgent) return;

    const thread = await api.threads.create({
      title: threadTitle,
      profileId: baseProfile?.id,
    });
    await insertThread(thread.threadId, threadTitle, {
      profileId: baseProfile?.id,
    });
  };

  // Sync the dialogs-store flag with the mounted state of this wrapper
  // (idempotent — the parent only renders this component when the flag is
  // already true; cleanup ensures the flag goes back to false on unmount).
  useEffect(() => {
    dialogsStore.setCreateAgentDialogVisible(true);
    // Fetch portal tags + room covers so the TagInput dropdown and avatar
    // cover picker have something to render without a flash of empty state.
    void tagsStore.fetchTags();
    void dialogsStore.getCovers().catch(() => undefined);
    void quotaStore.fetchPortalQuota();
    return () => {
      dialogsStore.setCreateAgentDialogVisible(false);
      dialogsStore.clearCoverProps();
    };
  }, [dialogsStore, tagsStore, quotaStore]);

  if (!visible) return null;

  return (
    <CreateAgentDialog
      title={title}
      visible={visible}
      onClose={onClose}
      onCreate={onCreate}
      fetchedTags={tagsStore.tags}
      isLoading={createEditAgentStore.isLoading}
      portalMcpServerId={portalMcpServerId}
      folderFormValidation={folderFormValidation}
      maxImageUploadSize={maxImageUploadSize}
    />
  );
};

export default observer(CreateAgentEvent);
