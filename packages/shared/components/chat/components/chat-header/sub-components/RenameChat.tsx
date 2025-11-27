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

import React from "react";
import { useTranslation } from "react-i18next";

import { ModalDialog, ModalDialogType } from "../../../../modal-dialog";
import { InputSize, InputType, TextInput } from "../../../../text-input";
import { Button, ButtonSize } from "../../../../button";

import { useChatStore } from "../../../store/chatStore";

import { RenameChatProps } from "../../../Chat.types";

const RenameChat = ({ chatId, prevTitle, onRenameToggle }: RenameChatProps) => {
  const { t } = useTranslation(["Common"]);

  const [isLoading, setIsLoading] = React.useState(false);

  const { renameChat } = useChatStore();

  const [newName, setNewName] = React.useState("");

  const handleRename = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewName(e.target.value);
    },
    [],
  );

  const onRenameClose = React.useCallback(() => {
    if (isLoading) return;
    onRenameToggle();
  }, [onRenameToggle, isLoading]);

  const onRenameAction = React.useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    await renameChat(chatId, newName);
    onRenameToggle();
    setIsLoading(false);
  }, [chatId, newName, onRenameToggle, renameChat, isLoading]);

  React.useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        onRenameAction();
      }
      if (e.key === "Escape") {
        onRenameClose();
      }
    };

    window.addEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [onRenameAction, onRenameClose]);

  return (
    <ModalDialog
      visible
      onClose={onRenameClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("Common:Rename")}</ModalDialog.Header>
      <ModalDialog.Body>
        <TextInput
          value={newName}
          onChange={handleRename}
          size={InputSize.base}
          type={InputType.text}
          maxLength={255}
          placeholder={prevTitle}
          scale
          autoFocus
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          size={ButtonSize.normal}
          label={t("Common:SaveButton")}
          onClick={onRenameAction}
          scale
          primary
          isLoading={isLoading}
          isDisabled={!newName || prevTitle === newName}
        />
        <Button
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          onClick={onRenameToggle}
          scale
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default RenameChat;
