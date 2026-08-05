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

import React from "react";

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { TTranslation } from "@docspace/shared/types";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

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
