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

import React, { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import TagsStore from "SRC_DIR/store/TagsStore";
import CreateEditAgentStore from "SRC_DIR/store/CreateEditAgentStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import DialogsStore from "SRC_DIR/store/DialogsStore";

import { CreateAgentDialog } from "../../dialogs";
import { TAgentParams } from "@docspace/shared/utils/aiAgents";

type CreateRoomEventProps = {
  title: string;
  visible: boolean;
  onClose: VoidFunction;

  fetchTags: TagsStore["fetchTags"];

  setAgentParams: CreateEditAgentStore["setAgentParams"];
  onCreateAgent: CreateEditAgentStore["onCreateAgent"];
  setOnClose: CreateEditAgentStore["setOnClose"];
  isLoading: CreateEditAgentStore["isLoading"];

  setCreateAgentDialogVisible: DialogsStore["setCreateAgentDialogVisible"];
  setCover: DialogsStore["setCover"];

  selectionItems: FilesStore["selection"];
};

const CreateRoomEvent = ({
  title,
  visible,
  onClose,

  fetchTags,
  setAgentParams,
  onCreateAgent,

  isLoading,
  setOnClose,
  setCreateAgentDialogVisible,
  setCover,

  selectionItems,
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
  }: TStore) => {
    const { fetchTags } = tagsStore;
    const { selections } = filesStore;

    const { setCreateAgentDialogVisible, setCover } = dialogsStore;

    const { setAgentParams, onCreateAgent, isLoading, setOnClose } =
      createEditAgentStore;

    const { isDefaultRoomsQuotaSet } = currentQuotaStore;

    const selectionItems = selections;

    return {
      fetchTags,
      setAgentParams,
      onCreateAgent,
      isLoading,
      setOnClose,
      setCreateAgentDialogVisible,

      setCover,
      selectionItems,
      isDefaultRoomsQuotaSet,
    };
  },
)(observer(CreateRoomEvent));
