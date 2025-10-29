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

import React, { useState } from "react";

import { Button } from "@docspace/shared/components/button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";

import TagHandler from "../../../helpers/TagHandler";
import SetAgentParams from "./sub-components/SetAgentParams";
import { useTranslation } from "react-i18next";
import {
  getStartAgentParams,
  TAgentParams,
  TAgentTagsParams,
} from "@docspace/shared/utils/aiAgents";

type CreateAgentDialogProps = {
  visible: boolean;
  title: string;
  onClose: VoidFunction;
  onCreate: (params: TAgentParams) => void;
  fetchedTags: string[];
  isLoading: boolean;
};

const CreateAgentDialog = ({
  visible,
  title,
  onClose,
  onCreate,

  fetchedTags,
  isLoading,
}: CreateAgentDialogProps) => {
  const { t } = useTranslation("Common");

  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isWrongTitle, setIsWrongTitle] = useState(false);
  const isMountRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountRef.current = false;
    };
  });

  const startAgentParams = getStartAgentParams(title);

  const [agentParams, setAgentParams] = useState({
    ...startAgentParams,
  });
  const [isValidTitle, setIsValidTitle] = useState(true);

  const setAgentTags = (newTags: TAgentTagsParams[]) =>
    setAgentParams({ ...agentParams, tags: newTags });

  const tagHandler = new TagHandler(
    agentParams.tags,
    setAgentTags,
    fetchedTags,
  );

  const isAgentTitleChanged = agentParams?.title?.trim() === "";

  const isModelSelected = !!agentParams?.modelId;

  const onCreateAgent = async () => {
    if (!agentParams?.title?.trim()) {
      setIsValidTitle(false);
      return;
    }

    await onCreate({ ...agentParams });
    if (isMountRef.current) {
      setAgentParams(startAgentParams);
    }
  };

  const onKeyUpHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isWrongTitle || !isModelSelected) return;
    if (e.keyCode === 13) onCreateAgent();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const tagInput = event.currentTarget.tagInput;

    if (!tagInput) onCreateAgent();

    const value = tagInput.value ?? "";
    const hasFocus = tagInput === document.activeElement;

    if ((hasFocus && value.length === 0) || !hasFocus) onCreateAgent();
  };

  const onCloseDialog = async () => {
    if (isLoading) return;

    onClose();
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={visible}
      onClose={onCloseDialog}
      isScrollLocked={isScrollLocked}
      onSubmit={handleSubmit}
      withForm
    >
      <ModalDialog.Header>{t("Common:CreateAgent")}</ModalDialog.Header>

      <ModalDialog.Body>
        <SetAgentParams
          tagHandler={tagHandler}
          agentParams={agentParams}
          setAgentParams={setAgentParams}
          setIsScrollLocked={setIsScrollLocked}
          isDisabled={isLoading}
          isValidTitle={isValidTitle}
          isWrongTitle={isWrongTitle}
          setIsValidTitle={setIsValidTitle}
          setIsWrongTitle={setIsWrongTitle}
          onKeyUp={onKeyUpHandler}
        />
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="shared_create-agent-modal_submit"
          tabIndex={5}
          label={t("Common:Create")}
          primary
          scale
          isDisabled={isAgentTitleChanged || isWrongTitle || !isModelSelected}
          isLoading={isLoading}
          type="submit"
          onClick={onCreateAgent}
          testId="create_agent_dialog_save"
        />
        <Button
          id="shared_create-agent-modal_cancel"
          tabIndex={5}
          label={t("Common:CancelButton")}
          scale
          isDisabled={isLoading}
          onClick={onCloseDialog}
          testId="create_agent_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default CreateAgentDialog;
