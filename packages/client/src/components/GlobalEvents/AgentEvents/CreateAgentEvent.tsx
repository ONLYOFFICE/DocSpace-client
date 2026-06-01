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

import React, { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { TAgentParams } from "@docspace/shared/utils/aiAgents";

import TagsStore from "SRC_DIR/store/TagsStore";
import CreateEditAgentStore from "SRC_DIR/store/CreateEditAgentStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import DialogsStore from "SRC_DIR/store/DialogsStore";

import { CreateAgentDialog } from "../../dialogs";

type CreateRoomEventProps = {
  title: string;
  visible: boolean;
  context: string;
  onClose: VoidFunction;

  fetchTags: TagsStore["fetchTags"];

  setAgentParams: CreateEditAgentStore["setAgentParams"];
  onCreateAgent: CreateEditAgentStore["onCreateAgent"];
  setOnClose: CreateEditAgentStore["setOnClose"];
  setOpenContext: CreateEditAgentStore["setOpenContext"];
  isLoading: CreateEditAgentStore["isLoading"];

  setCreateAgentDialogVisible: DialogsStore["setCreateAgentDialogVisible"];
  setCover: DialogsStore["setCover"];

  selectionItems: FilesStore["selection"];

  aiConfig: SettingsStore["aiConfig"];
};

const CreateRoomEvent = ({
  title,
  visible,
  onClose,
  context,

  fetchTags,
  setAgentParams,
  onCreateAgent,

  isLoading,
  setOnClose,
  setOpenContext,
  setCreateAgentDialogVisible,
  setCover,

  selectionItems,

  aiConfig,
}: CreateRoomEventProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);
  const [fetchedTags, setFetchedTags] = useState<string[]>([]);

  const onCreate = (agentParams: TAgentParams) => {
    const itemLogo = agentParams.logo
      ? agentParams.logo
      : selectionItems.length
        ? selectionItems[0].logo
        : null;

    setAgentParams({ ...agentParams, logo: itemLogo });
    setOnClose(onClose);

    onCreateAgent(t);
  };

  const fetchTagsAction = useCallback(async () => {
    const tags = (await fetchTags()) as string[];
    setFetchedTags(tags);
  }, []);

  useEffect(() => {
    fetchTagsAction();
  }, [fetchTagsAction]);

  useEffect(() => {
    setOpenContext(context ?? "");
    setCreateAgentDialogVisible(true);
    return () => {
      setCreateAgentDialogVisible(false);
      setCover();
    };
  }, []);

  if (!visible) return null;

  return (
    <CreateAgentDialog
      title={title}
      visible={visible}
      onClose={onClose}
      onCreate={onCreate}
      fetchedTags={fetchedTags}
      isLoading={isLoading}
      portalMcpServerId={aiConfig?.portalMcpServerId ?? ""}
    />
  );
};

export default inject(
  ({
    createEditAgentStore,
    tagsStore,
    dialogsStore,
    filesStore,
    currentQuotaStore,
    settingsStore,
  }: TStore) => {
    const { fetchTags } = tagsStore;
    const { selections } = filesStore;

    const { setCreateAgentDialogVisible, setCover } = dialogsStore;

    const { setAgentParams, onCreateAgent, isLoading, setOnClose, setOpenContext } =
      createEditAgentStore;

    const { isDefaultRoomsQuotaSet } = currentQuotaStore;

    const selectionItems = selections;

    return {
      fetchTags,
      setAgentParams,
      onCreateAgent,
      isLoading,
      setOnClose,
      setOpenContext,
      setCreateAgentDialogVisible,

      setCover,
      selectionItems,
      isDefaultRoomsQuotaSet,

      aiConfig: settingsStore.aiConfig,
    };
  },
)(observer(CreateRoomEvent));
