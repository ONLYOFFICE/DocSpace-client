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

import { useEffect } from "react";
import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

const EmptyTrashDialogComponent = (props) => {
  const {
    visible,
    t,
    tReady,
    isLoading,
    setEmptyTrashDialogVisible,
    emptyTrash,
    emptyArchive,

    isArchiveFolder,
    emptyPersonalRoom,
    isPersonalReadOnly,
  } = props;

  const onClose = () => setEmptyTrashDialogVisible(false);

  const sectionName = isArchiveFolder
    ? t("Common:Archive")
    : isPersonalReadOnly
      ? t("Common:MyDocuments")
      : t("Common:TrashSection");

  const onEmptyTrash = () => {
    onClose();

    const translations = {
      successOperation: t("SuccessEmptyAction", { sectionName }),
    };

    if (isPersonalReadOnly) {
      emptyPersonalRoom(translations);

      return;
    }

    if (isArchiveFolder) {
      emptyArchive(translations);
    } else {
      emptyTrash(translations);
    }
  };

  const onKeyPress = (e) => {
    if (e.keyCode === 13) {
      onEmptyTrash();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);

    return () => window.removeEventListener("keydown", onKeyPress);
  }, []);

  const description = t("DeleteForeverNote", { sectionName });

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("DeleteForeverTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{description}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="empty-archive_delete-submit"
          key="OKButton"
          label={t("Common:DeleteForeverButton")}
          size="normal"
          primary
          onClick={onEmptyTrash}
          isLoading={isLoading}
          scale
          testId="empty_trash_dialog_submit"
        />
        <Button
          id="empty-archive_delete-cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          isLoading={isLoading}
          scale
          testId="empty_trash_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const EmptyTrashDialog = withTranslation([
  "EmptyTrashDialog",
  "Common",
  "Translations",
])(EmptyTrashDialogComponent);

export default inject(
  ({ filesStore, filesActionsStore, treeFoldersStore, dialogsStore }) => {
    const { isLoading } = filesStore;
    const { emptyTrash, emptyArchive, emptyPersonalRoom } = filesActionsStore;

    const { isArchiveFolder, isPersonalReadOnly } = treeFoldersStore;

    const { emptyTrashDialogVisible: visible, setEmptyTrashDialogVisible } =
      dialogsStore;

    return {
      isLoading,

      visible,

      setEmptyTrashDialogVisible,
      emptyTrash,
      emptyArchive,

      isArchiveFolder,
      isPersonalReadOnly,
      emptyPersonalRoom,
    };
  },
)(observer(EmptyTrashDialog));
