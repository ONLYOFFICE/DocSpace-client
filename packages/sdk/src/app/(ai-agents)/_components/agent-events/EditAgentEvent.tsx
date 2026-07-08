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

import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import type { TAgent } from "@docspace/shared/api/ai/types";
import {
  getFetchedAgentParams,
  type TAgentParams,
} from "@docspace/shared/utils/aiAgents";

import EditAgentDialog from "../create-agent-dialog/EditAgentDialog";
import {
  useCreateEditAgentStore,
  useAgentDialogsStore,
  useAgentTagsStore,
  useAgentsQuotaStore,
} from "../../_store";

type Props = {
  visible: boolean;
  onClose: VoidFunction;
  item: TAgent;
  isDefaultAIAgentsQuotaSet?: boolean;
  folderFormValidation?: RegExp;
  maxImageUploadSize?: number;
};

const EditAgentEvent = ({
  visible,
  onClose,
  item,
  folderFormValidation,
  maxImageUploadSize,
}: Props) => {
  const { t } = useTranslation(["Common"]);

  const createEditAgentStore = useCreateEditAgentStore();
  const dialogsStore = useAgentDialogsStore();
  const tagsStore = useAgentTagsStore();
  const quotaStore = useAgentsQuotaStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoading, setIsInitLoading] = useState(false);

  const isMountedRef = React.useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchedAgentParams = getFetchedAgentParams(
    item,
    quotaStore.isDefaultAIAgentsQuotaSet,
  );

  const onSave = async (agentParams: TAgentParams) => {
    if (isMountedRef.current) setIsLoading(true);
    await createEditAgentStore.onSaveEditAgent(t, agentParams, item);
    if (isMountedRef.current) setIsLoading(false);
    onClose();
  };

  useEffect(() => {
    if (isMountedRef.current) setIsInitLoading(true);
    // Fetch tags + covers + portal quota in parallel so the dialog has
    // everything it needs to render avatar/cover picker + quota toggle
    // without flashing empty state.
    Promise.all([
      tagsStore.fetchTags(),
      dialogsStore.getCovers().catch(() => undefined),
      quotaStore.fetchPortalQuota(),
    ]).finally(() => {
      if (isMountedRef.current) setIsInitLoading(false);
    });
    // Hydrate cover selection so deleteRoomLogo can target the current agent.
    dialogsStore.setCoverSelection(item);
    // Re-fetch only when the agent identity changes — not on every parent
    // re-render that passes a new `item` reference for the same agent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsStore, dialogsStore, quotaStore, item.id]);

  if (!visible) return null;

  return (
    <EditAgentDialog
      visible={visible}
      onClose={onClose}
      fetchedAgentParams={fetchedAgentParams}
      fetchedTags={tagsStore.tags}
      onSave={onSave}
      isLoading={isLoading}
      isInitLoading={isInitLoading}
      hasCover={!!dialogsStore.cover}
      folderFormValidation={folderFormValidation}
      selection={item}
      maxImageUploadSize={maxImageUploadSize}
    />
  );
};

export default observer(EditAgentEvent);
