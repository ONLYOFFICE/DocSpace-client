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

import { useEffect } from "react";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
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
          label={t("DeleteForeverButton")}
          size="normal"
          primary
          onClick={onEmptyTrash}
          isLoading={isLoading}
          scale
        />
        <Button
          id="empty-archive_delete-cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          isLoading={isLoading}
          scale
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
