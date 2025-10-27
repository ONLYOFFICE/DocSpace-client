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
  fetchTags: TagsStore["fetchTags"];
  cover: ICover;
  onSaveEditAgent: CreateEditAgentStore["onSaveEditAgent"];
  isDefaultAgentsQuotaSet: CurrentQuotasStore["isDefaultRoomsQuotaSet"];
};

const EditAgentEvent = ({
  visible,
  onClose,
  item,
  fetchTags,
  cover,
  onSaveEditAgent,
  isDefaultAgentsQuotaSet,
}: EditAgentEventProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [fetchedTags, setFetchedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitLoading, setIsInitLoading] = useState(false);

  const fetchedAgentParams = getFetchedAgentParams(
    item,
    isDefaultAgentsQuotaSet,
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
    const { isDefaultRoomsQuotaSet } = currentQuotaStore;

    const { fetchTags } = tagsStore;

    const { cover } = dialogsStore;

    const { onSaveEditAgent } = createEditAgentStore;

    return {
      isDefaultAgentsQuotaSet: isDefaultRoomsQuotaSet,

      fetchTags,

      cover,
      onSaveEditAgent,
    };
  },
)(observer(EditAgentEvent));
