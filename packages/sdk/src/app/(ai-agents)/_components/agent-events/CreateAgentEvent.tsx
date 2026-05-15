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
} from "../../_store";
import CreateAgentDialog from "../create-agent-dialog";

type Props = {
  title: string;
  visible: boolean;
  onClose: VoidFunction;
  portalMcpServerId?: string;
  folderFormValidation?: RegExp;
};

const CreateAgentEvent = ({
  title,
  visible,
  onClose,
  portalMcpServerId = "",
  folderFormValidation,
}: Props) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const createEditAgentStore = useCreateEditAgentStore();
  const dialogsStore = useAgentDialogsStore();

  const { useProfilesStore, useThreadsStore } = useStores();
  const api = useApi();
  const profiles = useProfilesStore((s) => s.profiles);
  const insertThread = useThreadsStore((s) => s.insertThread);

  const onCreate = async (agentParams: TAgentParams) => {
    const baseProfile = agentParams.profileId
      ? profiles.find((p) => p.id === agentParams.profileId)
      : profiles.find((p) => p.modelId === agentParams.modelId);

    const threadTitle = agentParams.title || t("Common:NewAgent");
    const thread = await api.threads.create({
      title: threadTitle,
      profileId: baseProfile?.id,
    });
    await insertThread(thread.threadId, threadTitle, {
      profileId: baseProfile?.id,
    });

    createEditAgentStore.setAgentParams({
      ...agentParams,
      logo: agentParams.logo,
    });
    createEditAgentStore.setOnClose(onClose);
    createEditAgentStore.onCreateAgent(t);
  };

  // Sync the dialogs-store flag with the mounted state of this wrapper
  // (idempotent — the parent only renders this component when the flag is
  // already true; cleanup ensures the flag goes back to false on unmount).
  useEffect(() => {
    dialogsStore.setCreateAgentDialogVisible(true);
    return () => {
      dialogsStore.setCreateAgentDialogVisible(false);
      dialogsStore.clearCoverProps();
    };
  }, [dialogsStore]);

  if (!visible) return null;

  return (
    <CreateAgentDialog
      title={title}
      visible={visible}
      onClose={onClose}
      onCreate={onCreate}
      isLoading={createEditAgentStore.isLoading}
      portalMcpServerId={portalMcpServerId}
      folderFormValidation={folderFormValidation}
    />
  );
};

export default observer(CreateAgentEvent);
