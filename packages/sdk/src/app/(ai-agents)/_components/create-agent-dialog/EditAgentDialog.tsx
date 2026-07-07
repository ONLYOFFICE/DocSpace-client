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

import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import type {
  TAgentParams,
  TAgentTagsParams,
} from "@docspace/shared/utils/aiAgents";
import type { TAgent } from "@docspace/shared/api/ai/types";
import MCPServersSelector from "@docspace/ui-kit/selectors/MCPServers";

import TagHandler from "../../_helpers/TagHandler";
import SetAgentParams from "./sub-components/SetAgentParams";
import { useMCP } from "./hooks/useMCP";
import { modelCache } from "./sub-components/modelCache";

type EditAgentDialogProps = {
  visible: boolean;
  onClose: VoidFunction;
  onSave: (params: TAgentParams) => void;
  onOwnerChange?: () => void;
  isLoading: boolean;
  isInitLoading: boolean;
  fetchedAgentParams: TAgentParams;
  fetchedTags: string[];
  hasCover: boolean;
  folderFormValidation?: RegExp;
  selection?: TAgent;
  maxImageUploadSize?: number;
};

const EditAgentDialog = ({
  visible,
  onClose,
  onSave,
  onOwnerChange,
  isLoading,
  fetchedAgentParams,
  fetchedTags,
  isInitLoading,
  hasCover,
  selection,
  maxImageUploadSize,
  folderFormValidation,
}: EditAgentDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const [agentParams, setAgentParams] = useState({
    ...fetchedAgentParams,
  });

  const prevRoomParams = useRef(
    Object.freeze({
      ...agentParams,
    }),
  );

  const compareRoomParams = (
    prevParams: TAgentParams,
    currentParams: TAgentParams,
  ) => {
    return (
      prevParams.title === currentParams.title &&
      prevParams.agentOwner?.id === currentParams.agentOwner?.id &&
      prevParams.tags
        .map((tag) => tag.name)
        .sort()
        .join("|")
        .toLowerCase() ===
        currentParams.tags
          .map((tag) => tag.name)
          .sort()
          .join("|")
          .toLowerCase() &&
      ((prevParams.icon.uploadedFile === "" &&
        (currentParams.icon.uploadedFile === null ||
          currentParams.icon.uploadedFile === undefined)) ||
        prevParams.icon.uploadedFile === currentParams.icon.uploadedFile) &&
      prevParams.quota === currentParams.quota &&
      prevParams.prompt === currentParams.prompt &&
      prevParams.profileId === currentParams.profileId &&
      currentParams.mcpServers?.every((id) =>
        currentParams.mcpServersInitial?.includes(id),
      ) &&
      currentParams.mcpServers?.length ===
        currentParams.mcpServersInitial?.length
    );
  };

  const setAgentParamsAction = React.useCallback(
    (newParams: Partial<TAgentParams>) => {
      setAgentParams((value) => ({ ...value, ...newParams }));
    },
    [],
  );

  const {
    isMCPSelectorVisible,
    setIsMCPSelectorVisible,
    onSubmit,
    initSelectedServers,
    onClickAction,
    selectedServers,
    setSelectedServers,
  } = useMCP({
    agentParams,
    setAgentParams: setAgentParamsAction,
  });

  const setAgentTags = React.useCallback(
    (newTags: TAgentTagsParams[]) =>
      setAgentParams((value) => ({ ...value, tags: newTags })),
    [],
  );

  const tagHandler = React.useMemo(
    () => new TagHandler(agentParams.tags, setAgentTags, fetchedTags),
    [agentParams.tags, setAgentTags, fetchedTags],
  );

  const onEditRoom = () => {
    if (!agentParams.title.trim()) {
      setIsValidTitle(false);
      return;
    }

    onSave(agentParams);
  };

  const onKeyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isWrongTitle) return;
    if (e.key === "Enter") onEditRoom();
  };

  const onCloseAction = () => {
    if (isLoading) return;
    modelCache.clear();
    onClose && onClose();
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={visible}
      onClose={onCloseAction}
      isScrollLocked={isScrollLocked}
      isLoading={isInitLoading}
      containerVisible={isMCPSelectorVisible}
    >
      {isMCPSelectorVisible ? (
        <ModalDialog.Container>
          <MCPServersSelector
            onSubmit={onSubmit}
            onClose={onCloseAction}
            onBackClick={() => setIsMCPSelectorVisible(false)}
            initedSelectedServers={initSelectedServers}
          />
        </ModalDialog.Container>
      ) : null}

      <ModalDialog.Header>{t("Common:EditAgent")}</ModalDialog.Header>

      <ModalDialog.Body>
        <SetAgentParams
          tagHandler={tagHandler}
          agentParams={agentParams}
          setAgentParams={setAgentParamsAction}
          setIsScrollLocked={setIsScrollLocked}
          selection={selection}
          maxImageUploadSize={maxImageUploadSize}
          isEdit
          isDisabled={isLoading}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          setIsValidTitle={setIsValidTitle}
          setIsWrongTitle={setIsWrongTitle}
          onKeyUp={onKeyUpHandler}
          onOwnerChange={onOwnerChange}
          onClickAction={onClickAction}
          selectedServers={selectedServers}
          setSelectedServers={setSelectedServers}
          folderFormValidation={folderFormValidation}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          tabIndex={5}
          label={t("Common:SaveButton")}
          primary
          scale
          onClick={onEditRoom}
          isDisabled={
            !agentParams.profileId ||
            (!hasCover
              ? isWrongTitle ||
                compareRoomParams(prevRoomParams.current, agentParams)
              : false)
          }
          isLoading={isLoading}
        />
        <Button
          tabIndex={5}
          label={t("Common:CancelButton")}
          scale
          onClick={onCloseAction}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EditAgentDialog;
