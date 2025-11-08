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

import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import type {
  TAgentParams,
  TAgentTagsParams,
} from "@docspace/shared/utils/aiAgents";
import type { TCreatedBy } from "@docspace/shared/types";

import type { ICover } from "SRC_DIR/components/dialogs/RoomLogoCoverDialog/RoomLogoCoverDialog.types";

import TagHandler from "../../../helpers/TagHandler";
import ChangeRoomOwnerPanel from "../../panels/ChangeRoomOwnerPanel";

import SetAgentParams from "./sub-components/SetAgentParams";

type EditAgentDialogProps = {
  visible: boolean;
  onClose: VoidFunction;
  onSave: (params: TAgentParams) => void;
  isLoading: boolean;
  isInitLoading: boolean;
  fetchedAgentParams: TAgentParams;
  fetchedTags: string[];
  cover: ICover;
};

const EditAgentDialog = ({
  visible,
  onClose,
  onSave,
  isLoading,
  fetchedAgentParams,
  fetchedTags,
  isInitLoading,
  cover,
}: EditAgentDialogProps) => {
  const { t } = useTranslation(["CreateEditRoomDialog", "Common", "Files"]);

  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isValidTitle, setIsValidTitle] = useState(true);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const [changeRoomOwnerIsVisible, setChangeRoomOwnerIsVisible] =
    useState(false);
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
      prevParams.modelId === currentParams.modelId &&
      prevParams.providerId === currentParams.providerId &&
      prevParams.prompt === currentParams.prompt &&
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

  const setAgentTags = (newTags: TAgentTagsParams[]) =>
    setAgentParams({ ...agentParams, tags: newTags });

  const tagHandler = new TagHandler(
    agentParams.tags,
    setAgentTags,
    fetchedTags,
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
    if (e.keyCode === 13) onEditRoom();
  };

  const onCloseAction = () => {
    if (isLoading) return;

    onClose && onClose();
  };

  const onBackClick = () => {
    if (changeRoomOwnerIsVisible) setChangeRoomOwnerIsVisible(false);
  };

  const onOwnerChange = () => {
    setChangeRoomOwnerIsVisible(true);
  };

  const onSetNewOwner = (agentOwner: TCreatedBy) => {
    setChangeRoomOwnerIsVisible(false);
    setAgentParams({ ...agentParams, agentOwner });
  };

  const onCloseRoomOwnerPanel = () => {
    setChangeRoomOwnerIsVisible(false);
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={visible}
      onClose={onCloseAction}
      onBackClick={onBackClick}
      isScrollLocked={isScrollLocked}
      isLoading={isInitLoading}
      containerVisible={changeRoomOwnerIsVisible}
    >
      {changeRoomOwnerIsVisible ? (
        <ModalDialog.Container>
          <ChangeRoomOwnerPanel
            useModal={false}
            roomOwner={agentParams.agentOwner}
            onOwnerChange={onSetNewOwner}
            showBackButton
            onClose={onCloseRoomOwnerPanel}
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
          isEdit
          isDisabled={isLoading}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          setIsValidTitle={setIsValidTitle}
          setIsWrongTitle={setIsWrongTitle}
          onKeyUp={onKeyUpHandler}
          onOwnerChange={onOwnerChange}
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
            !cover
              ? isWrongTitle ||
                compareRoomParams(prevRoomParams.current, agentParams)
              : false
          }
          isLoading={isLoading}
        />
        <Button
          tabIndex={5}
          label={t("Common:CancelButton")}
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default EditAgentDialog;
