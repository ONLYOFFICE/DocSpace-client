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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { TTranslation } from "@docspace/shared/types";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import DialogsStore from "SRC_DIR/store/DialogsStore";
import SelectedFolderStore, {
  TSelectedFolder,
} from "SRC_DIR/store/SelectedFolderStore";
import FilesActionsStore from "SRC_DIR/store/FilesActionsStore";

export interface ReorderIndexDialogProps {
  reorderIndexOfFiles: (id: number | string | null, t: TTranslation) => void;
  setIsVisible: (visible: boolean) => void;
  visible: boolean;
  selectedFolder: TSelectedFolder;
}

const ReorderIndexDialog = ({
  visible,
  setIsVisible,
  reorderIndexOfFiles,
  selectedFolder,
}: ReorderIndexDialogProps) => {
  const { t, ready } = useTranslation(["Files", "Common"]);

  const onClose = () => {
    setIsVisible(false);
  };

  const onReorder = () => {
    reorderIndexOfFiles(selectedFolder?.id, t);
    setIsVisible(false);
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.modal}
      isLoading={!ready}
      visible={visible}
      onClose={onClose}
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text fontSize="13px" fontWeight={400}>
          {t("Files:ReorderIndex")}
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="create-room"
          key="OKButton"
          label={t("Files:Reorder")}
          size={ButtonSize.normal}
          primary
          onClick={onReorder}
          scale
        />
        <Button
          id="cancel-share-folder"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    dialogsStore,
    filesActionsStore,
    selectedFolderStore,
  }: {
    dialogsStore: DialogsStore;
    filesActionsStore: FilesActionsStore;
    selectedFolderStore: SelectedFolderStore;
  }) => {
    const { reorderDialogVisible, setReorderDialogVisible } = dialogsStore;
    const selectedFolder = selectedFolderStore.getSelectedFolder();
    const { reorderIndexOfFiles } = filesActionsStore;

    return {
      visible: reorderDialogVisible,
      setIsVisible: setReorderDialogVisible,
      reorderIndexOfFiles,
      selectedFolder,
    };
  },
)(observer(ReorderIndexDialog));
