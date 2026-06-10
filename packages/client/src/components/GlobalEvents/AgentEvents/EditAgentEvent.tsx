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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { TAgent } from "@docspace/shared/api/ai/types";
import {
  getFetchedAgentParams,
  TAgentParams,
} from "@docspace/shared/utils/aiAgents";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import EditAgentDialog from "SRC_DIR/components/dialogs/CreateEditAgentDialog/EditAgentDialog";
import TagsStore from "SRC_DIR/store/TagsStore";
import { ICover } from "SRC_DIR/components/dialogs/RoomLogoCoverDialog/RoomLogoCoverDialog.types";
import CreateEditAgentStore from "SRC_DIR/store/CreateEditAgentStore";

type EditAgentEventProps = {
  visible: boolean;
  onClose: VoidFunction;
  item: TAgent;
  context?: string;
  fetchTags: TagsStore["fetchTags"];
  cover: ICover;
  onSaveEditAgent: CreateEditAgentStore["onSaveEditAgent"];
  setOpenContext: CreateEditAgentStore["setOpenContext"];
  isDefaultAIAgentsQuotaSet: CurrentQuotasStore["isDefaultAIAgentsQuotaSet"];
};

const EditAgentEvent = ({
  visible,
  onClose,
  item,
  context,
  fetchTags,
  cover,
  onSaveEditAgent,
  setOpenContext,
  isDefaultAIAgentsQuotaSet,
}: EditAgentEventProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [fetchedTags, setFetchedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoading, setIsInitLoading] = useState(false);

  const fetchedAgentParams = getFetchedAgentParams(
    item,
    isDefaultAIAgentsQuotaSet,
  );

  const onSave = async (agentParams: TAgentParams) => {
    setIsLoading(true);

    await onSaveEditAgent(t, agentParams, item);

    setIsLoading(false);
    onClose();
  };

  useEffect(() => {
    setIsInitLoading(true);

    const fetchInfo = async () => {
      const tags = await fetchTags();

      setFetchedTags(tags as string[]);

      setIsInitLoading(false);
    };

    fetchInfo();
  }, []);

  useEffect(() => {
    setOpenContext(context ?? "");
    return () => {
      setOpenContext("");
    };
  }, [context, setOpenContext]);

  if (!visible) return null;

  return (
    <EditAgentDialog
      visible={visible}
      onClose={onClose}
      fetchedAgentParams={fetchedAgentParams}
      onSave={onSave}
      fetchedTags={fetchedTags}
      isLoading={isLoading}
      isInitLoading={isInitLoading}
      cover={cover}
    />
  );
};

export default inject(
  ({
    tagsStore,
    dialogsStore,
    createEditAgentStore,
    currentQuotaStore,
  }: TStore) => {
    const { isDefaultAIAgentsQuotaSet } = currentQuotaStore;

    const { fetchTags } = tagsStore;

    const { cover } = dialogsStore;

    const { onSaveEditAgent, setOpenContext } = createEditAgentStore;

    return {
      isDefaultAIAgentsQuotaSet,

      fetchTags,

      cover,
      onSaveEditAgent,
      setOpenContext,
    };
  },
)(observer(EditAgentEvent));
