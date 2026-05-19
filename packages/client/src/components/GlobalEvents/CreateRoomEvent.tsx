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
import { Trans, useTranslation } from "react-i18next";

import {
  getFetchedRoomParams,
  TRoomParams,
} from "@docspace/shared/utils/rooms";
import { Text } from "@docspace/ui-kit/components/text";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { RoomsType } from "@docspace/shared/enums";
import { TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";

import TagsStore from "SRC_DIR/store/TagsStore";
import CreateEditRoomStore from "SRC_DIR/store/CreateEditRoomStore";
import { ThirdPartyStore } from "SRC_DIR/store/ThirdPartyStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import DialogsStore from "SRC_DIR/store/DialogsStore";
import FilesActionStore from "SRC_DIR/store/FilesActionsStore";

import { CreateRoomDialog } from "../dialogs";

type CreateRoomEventProps = {
  title: string;
  visible: boolean;
  startRoomType: RoomsType;
  item: TFolder;
  onClose: VoidFunction;

  processCreatingRoomFromData: FilesActionStore["processCreatingRoomFromData"];
  setProcessCreatingRoomFromData: FilesActionStore["setProcessCreatingRoomFromData"];

  fetchTags: TagsStore["fetchTags"];

  setRoomParams: CreateEditRoomStore["setRoomParams"];
  onCreateRoom: CreateEditRoomStore["onCreateRoom"];
  setSelectedRoomType: CreateEditRoomStore["setSelectedRoomType"];
  setIsLoading: CreateEditRoomStore["setIsLoading"];
  setOnClose: CreateEditRoomStore["setOnClose"];
  isCorrectWatermark: CreateEditRoomStore["isCorrectWatermark"];
  confirmDialogIsLoading: CreateEditRoomStore["confirmDialogIsLoading"];
  isLoading: CreateEditRoomStore["isLoading"];

  createRoomConfirmDialogVisible: DialogsStore["createRoomConfirmDialogVisible"];
  setCreateRoomConfirmDialogVisible: DialogsStore["setCreateRoomConfirmDialogVisible"];
  connectDialogVisible: DialogsStore["connectDialogVisible"];
  setCreateRoomDialogVisible: DialogsStore["setCreateRoomDialogVisible"];
  setCover: DialogsStore["setCover"];

  fetchThirdPartyProviders: ThirdPartyStore["fetchThirdPartyProviders"];
  deleteThirdParty: ThirdPartyStore["deleteThirdParty"];
  getThirdPartyIcon: ThirdPartyStore["getThirdPartyIcon"];

  enableThirdParty: FilesSettingsStore["enableThirdParty"];

  selectionItems: FilesStore["selection"];

  isDefaultRoomsQuotaSet: CurrentQuotasStore["isDefaultRoomsQuotaSet"];
};

const CreateRoomEvent = ({
  title,
  visible,
  onClose,

  fetchTags,
  setRoomParams,
  onCreateRoom,
  createRoomConfirmDialogVisible,
  setCreateRoomConfirmDialogVisible,
  confirmDialogIsLoading,
  connectDialogVisible,

  isLoading,
  setIsLoading,
  setOnClose,
  setCreateRoomDialogVisible,
  setCover,

  fetchThirdPartyProviders,
  enableThirdParty,
  deleteThirdParty,
  startRoomType,
  isCorrectWatermark,
  processCreatingRoomFromData,
  setProcessCreatingRoomFromData,
  selectionItems,
  setSelectedRoomType,
  getThirdPartyIcon,
  isDefaultRoomsQuotaSet,
  item,
}: CreateRoomEventProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);
  const [fetchedTags, setFetchedTags] = useState<string[]>([]);

  const onCreate = (roomParams: TRoomParams) => {
    const itemLogo = roomParams.logo
      ? roomParams.logo
      : selectionItems.length
        ? selectionItems[0].logo
        : null;

    setRoomParams({ ...roomParams, logo: itemLogo });
    setOnClose(onClose);

    const notConnectedThirdparty =
      roomParams.storageLocation.isThirdparty &&
      !roomParams.storageLocation.storageFolderId;

    if (notConnectedThirdparty || !isCorrectWatermark(roomParams.watermark!)) {
      setCreateRoomConfirmDialogVisible(true);

      return;
    }

    const successToast = roomParams.isTemplate ? (
      <Trans
        t={t}
        ns="Files"
        i18nKey="TemplateRoomCreated"
        values={{
          title: roomParams.title,
        }}
        components={{
          1: <Text as="span" fontWeight={600} fontSize="12px" />,
        }}
      />
    ) : null;

    onCreateRoom(t, false, successToast as Element | null);
  };

  const fetchTagsAction = useCallback(async () => {
    const tags = (await fetchTags()) as string[];
    setFetchedTags(tags);
  }, []);

  useEffect(() => {
    fetchTagsAction();
  }, [fetchTagsAction]);

  useEffect(() => {
    setCreateRoomDialogVisible(true);
    return () => {
      setCreateRoomDialogVisible(false);
      setCover();
    };
  }, []);

  const roomParams = item
    ? {
        fetchedRoomParams: getFetchedRoomParams(
          item as TRoom,
          getThirdPartyIcon,
          isDefaultRoomsQuotaSet!,
        ),
      }
    : { fetchedRoomParams: null };

  return (
    <CreateRoomDialog
      title={title}
      t={t}
      visible={
        visible && !connectDialogVisible && !createRoomConfirmDialogVisible
          ? !confirmDialogIsLoading
          : null
      }
      onClose={onClose}
      onCreate={onCreate}
      startRoomType={startRoomType}
      fetchedTags={fetchedTags}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      deleteThirdParty={deleteThirdParty}
      fetchThirdPartyProviders={fetchThirdPartyProviders}
      enableThirdParty={enableThirdParty}
      processCreatingRoomFromData={processCreatingRoomFromData}
      setProcessCreatingRoomFromData={setProcessCreatingRoomFromData}
      selectionItems={selectionItems}
      setSelectedRoomType={setSelectedRoomType}
      getThirdPartyIcon={getThirdPartyIcon}
      isDefaultRoomsQuotaSet={isDefaultRoomsQuotaSet}
      {...roomParams}
    />
  );
};

export default inject(
  ({
    createEditRoomStore,
    tagsStore,
    dialogsStore,
    filesSettingsStore,
    filesStore,
    filesActionsStore,
    currentQuotaStore,
  }: TStore) => {
    const { fetchTags } = tagsStore;
    const { selections } = filesStore;

    const { processCreatingRoomFromData, setProcessCreatingRoomFromData } =
      filesActionsStore;

    const { deleteThirdParty, fetchThirdPartyProviders, getThirdPartyIcon } =
      filesSettingsStore.thirdPartyStore;

    const { enableThirdParty } = filesSettingsStore;

    const {
      createRoomConfirmDialogVisible,
      setCreateRoomConfirmDialogVisible,
      connectDialogVisible,
      setCreateRoomDialogVisible,
      setCover,
    } = dialogsStore;

    const {
      setRoomParams,
      onCreateRoom,
      isLoading,
      setIsLoading,
      setOnClose,
      confirmDialogIsLoading,

      isCorrectWatermark,
      setSelectedRoomType,
    } = createEditRoomStore;

    const { isDefaultRoomsQuotaSet } = currentQuotaStore;

    const selectionItems = selections;

    return {
      fetchTags,
      setRoomParams,
      onCreateRoom,
      createRoomConfirmDialogVisible,
      setCreateRoomConfirmDialogVisible,
      connectDialogVisible,
      isLoading,
      setIsLoading,
      setOnClose,
      confirmDialogIsLoading,
      setCreateRoomDialogVisible,
      fetchThirdPartyProviders,
      enableThirdParty,
      deleteThirdParty,

      isCorrectWatermark,
      setCover,
      selectionItems,
      processCreatingRoomFromData,
      setSelectedRoomType,
      setProcessCreatingRoomFromData,
      getThirdPartyIcon,
      isDefaultRoomsQuotaSet,
    };
  },
)(observer(CreateRoomEvent));
