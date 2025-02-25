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
import { toastr } from "@docspace/shared/components/toast";
import { getTitleWithoutExtension } from "@docspace/shared/utils";
import Dialog from "./sub-components/Dialog";

const RenameEvent = ({
  type,
  item,
  onClose,

  addActiveItems,

  updateFile,
  renameFolder,

  completeAction,
  clearActiveOperations,

  setEventDialogVisible,
  eventDialogVisible,
}) => {
  const [startValue, setStartValue] = React.useState("");

  const { t } = useTranslation(["Files"]);

  const onCancel = React.useCallback(
    (e) => {
      onClose && onClose(e);
      setEventDialogVisible(false);
    },
    [onClose, setEventDialogVisible],
  );

  React.useEffect(() => {
    setStartValue(getTitleWithoutExtension(item, false));

    setEventDialogVisible(true);
  }, [item]);

  const onUpdate = React.useCallback(
    (e, value) => {
      const originalTitle = getTitleWithoutExtension(item);

      let timerId;

      const isSameTitle =
        originalTitle.trim() === value.trim() || value.trim() === "";

      const isFile = item.fileExst || item.contentLength;

      if (isSameTitle) {
        setStartValue(originalTitle);

        onCancel();

        return completeAction(item, type);
      }
      timerId = setTimeout(() => {
        isFile ? addActiveItems([item.id]) : addActiveItems(null, [item.id]);
      }, 500);

      isFile
        ? updateFile(item.id, value)
            .then(() => completeAction(item, type))
            .then(() =>
              toastr.success(
                t("FileRenamed", {
                  oldTitle: item.title,
                  newTitle: value + item.fileExst,
                }),
              ),
            )
            .catch((err) => {
              toastr.error(err);
              completeAction(item, type);
            })
            .finally(() => {
              clearTimeout(timerId);
              timerId = null;
              clearActiveOperations([item.id]);

              onCancel();
            })
        : renameFolder(item.id, value)
            .then(() => completeAction(item, type))
            .then(() => {
              toastr.success(
                t("FolderRenamed", {
                  folderTitle: item.title,
                  newFoldedTitle: value,
                }),
              );
            })
            .catch((err) => {
              toastr.error(err);
              completeAction(item, type);
            })
            .finally(() => {
              clearTimeout(timerId);
              timerId = null;
              clearActiveOperations(null, [item.id]);

              onCancel();
            });
    },
    [
      onCancel,
      addActiveItems,
      clearActiveOperations,
      completeAction,
      item,
      t,
      type,
      updateFile,
      renameFolder,
    ],
  );

  return (
    <Dialog
      t={t}
      visible={eventDialogVisible}
      title={t("Common:Rename")}
      startValue={startValue}
      onSave={onUpdate}
      onCancel={onCancel}
      onClose={onCancel}
    />
  );
};

export default inject(
  ({
    filesStore,
    filesActionsStore,
    selectedFolderStore,
    uploadDataStore,
    dialogsStore,
  }) => {
    const { addActiveItems, updateFile, renameFolder } = filesStore;

    const { id, setSelectedFolder } = selectedFolderStore;

    const { completeAction } = filesActionsStore;

    const { clearActiveOperations } = uploadDataStore;
    const { setEventDialogVisible, eventDialogVisible } = dialogsStore;

    return {
      addActiveItems,
      updateFile,
      renameFolder,

      completeAction,

      clearActiveOperations,
      setEventDialogVisible,
      eventDialogVisible,

      selectedFolderId: id,

      setSelectedFolder,
    };
  },
)(observer(RenameEvent));
