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

import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { observer, inject } from "mobx-react";
import { useNavigate } from "react-router";
import { Events, FolderType, RoomsType } from "@docspace/shared/enums";
import { toastr } from "@docspace/shared/components/toast";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import { copySelectedText } from "@docspace/shared/utils/copy";

const withHotkeys = (Component) => {
  const WithHotkeys = (props) => {
    const {
      t,

      viewAs,
      setViewAs,
      setHotkeyPanelVisible,
      confirmDelete,
      setDeleteDialogVisible,
      setSelectFileDialogVisible,
      deleteAction,
      isAvailableOption,

      selectFile,
      selectBottom,
      selectUpper,
      selectLeft,
      selectRight,
      multiSelectBottom,
      multiSelectUpper,
      multiSelectRight,
      multiSelectLeft,
      moveCaretBottom,
      moveCaretUpper,
      moveCaretLeft,
      moveCaretRight,
      openItem,
      selectAll,
      deselectAll,
      activateHotkeys,
      onClickBack,

      uploadFile,
      enabledHotkeys,
      mediaViewerIsVisible,

      isFavoritesFolder,
      isRecentFolder,
      isTrashFolder,
      isArchiveFolder,
      isRoomsFolder,

      selection,
      setFavoriteAction,
      filesIsLoading,

      isVisitor,
      deleteRooms,
      archiveRooms,
      isWarningRoomsDialog,
      setQuotaWarningDialogVisible,

      security,
      copyToClipboard,
      uploadClipboardFiles,

      isGroupMenuBlocked,
      isFormRoom,
      isParentFolderFormRoom,
      isIndexEditingMode,
      enableSelection,
    } = props;

    const navigate = useNavigate();

    const [isEnabled, setIsEnabled] = useState(true);

    const hotkeysFilter = {
      filter: (ev) =>
        ev.target?.type === "checkbox" || ev.target?.tagName !== "INPUT",
      filterPreventDefault: false,
      enableOnTags: ["INPUT"],
      enabled:
        enabledHotkeys && !mediaViewerIsVisible && !filesIsLoading && isEnabled,
      // keyup: true,
      // keydown: false,
    };

    const onKeyDown = (e) => {
      const someDialogIsOpen = checkDialogsOpen();
      setIsEnabled(!someDialogIsOpen);

      if (isIndexEditingMode) return;

      activateHotkeys(e);
    };

    const folderWithNoAction =
      isFavoritesFolder ||
      isRecentFolder ||
      isTrashFolder ||
      isArchiveFolder ||
      isRoomsFolder ||
      isVisitor ||
      !security?.Create;

    const onCreate = (extension) => {
      if (
        folderWithNoAction ||
        (Boolean(extension) && (isFormRoom || isParentFolderFormRoom))
      )
        return;

      const event = new Event(Events.CREATE);

      const payload = {
        extension,
        id: -1,
      };

      event.payload = payload;

      window.dispatchEvent(event);
    };

    const onRename = () => {
      if (selection.length === 1) {
        const item = selection[0];

        if (!item.contextOptions.includes("rename")) return;

        const event = new Event(Events.RENAME);
        event.item = item;
        window.dispatchEvent(event);
      }
    };

    const onCreateRoom = () => {
      if (!isVisitor && isRoomsFolder && security?.Create) {
        if (isWarningRoomsDialog) {
          setQuotaWarningDialogVisible(true);
          return;
        }

        const event = new Event(Events.ROOM_CREATE);
        window.dispatchEvent(event);
      }
    };

    const onPaste = async (e) => {
      const someDialogIsOpen = checkDialogsOpen();

      if (someDialogIsOpen) return;

      uploadClipboardFiles(t, e);
    };

    useEffect(() => {
      window.addEventListener("keydown", onKeyDown);
      document.addEventListener("paste", onPaste);

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("paste", onPaste);
      };
    });

    // Select/deselect item
    useHotkeys("x", selectFile);

    useHotkeys(
      "*",
      (e) => {
        const someDialogIsOpen = checkDialogsOpen();
        if (someDialogIsOpen) return;

        if (e.key === "Alt" && e.ctrlKey) {
          return enableSelection(e);
        }

        if (e.shiftKey || e.ctrlKey || isIndexEditingMode || e.type === "keyup")
          return;

        switch (e.key) {
          case "ArrowDown":
          case "j": {
            return selectBottom();
          }

          case "ArrowUp":
          case "k": {
            return selectUpper();
          }

          case "ArrowRight":
          case "l": {
            return selectRight();
          }

          case "ArrowLeft":
          case "h": {
            return selectLeft();
          }

          default:
            break;
        }
      },
      { ...hotkeysFilter, keyup: true, keydown: true },
    );

    // //Select bottom element
    // useHotkeys("j, DOWN", selectBottom, hotkeysFilter);

    // //Select upper item
    // useHotkeys("k, UP", selectUpper, hotkeysFilter);

    // //Select item on the left
    // useHotkeys("h, LEFT", selectLeft, hotkeysFilter);

    // //Select item on the right
    // useHotkeys("l, RIGHT", selectRight, hotkeysFilter);

    // Expand Selection DOWN
    useHotkeys("shift+DOWN", multiSelectBottom, hotkeysFilter);

    // Expand Selection UP
    useHotkeys("shift+UP", multiSelectUpper, hotkeysFilter);

    // Expand Selection RIGHT
    useHotkeys("shift+RIGHT", () => multiSelectRight(), hotkeysFilter);

    // Expand Selection LEFT
    useHotkeys("shift+LEFT", () => multiSelectLeft(), hotkeysFilter);

    // Select all files and folders
    useHotkeys(
      "shift+a, ctrl+a",
      (e) => {
        e.preventDefault();
        selectAll();
      },
      hotkeysFilter,
    );

    // Deselect all files and folders
    useHotkeys("shift+n, ESC", deselectAll, hotkeysFilter);

    // Move down without changing selection
    useHotkeys("ctrl+DOWN, command+DOWN", moveCaretBottom, hotkeysFilter);

    // Move up without changing selection
    useHotkeys("ctrl+UP, command+UP", moveCaretUpper, hotkeysFilter);

    // Move left without changing selection
    useHotkeys("ctrl+LEFT, command+LEFT", moveCaretLeft, hotkeysFilter);

    // Move right without changing selection
    useHotkeys("ctrl+RIGHT, command+RIGHT", moveCaretRight, hotkeysFilter);

    // Open item
    useHotkeys("Enter", () => openItem(t), hotkeysFilter);

    // Back to parent folder
    useHotkeys(
      "Backspace",
      () => {
        const someDialogIsOpen = checkDialogsOpen();
        if (!someDialogIsOpen) onClickBack();
      },
      hotkeysFilter,
    );

    // Change viewAs
    useHotkeys(
      "v",
      () => (viewAs === "tile" ? setViewAs("table") : setViewAs("tile")),
      hotkeysFilter,
    );

    // Crete document
    useHotkeys("Shift+d", () => onCreate("docx"), {
      ...hotkeysFilter,
      ...{ keyup: true },
    });

    // Crete spreadsheet
    useHotkeys("Shift+s", () => onCreate("xlsx"), {
      ...hotkeysFilter,
      ...{ keyup: true },
    });

    // Crete presentation
    useHotkeys("Shift+p", () => onCreate("pptx"), {
      ...hotkeysFilter,
      ...{ keyup: true },
    });

    // Crete form template
    useHotkeys("Shift+o", () => onCreate("pdf"), {
      ...hotkeysFilter,
      ...{ keyup: true },
    });

    // Crete form template from file
    useHotkeys(
      "Alt+Shift+o",
      () => {
        if (folderWithNoAction || isFormRoom || isParentFolderFormRoom) return;
        setSelectFileDialogVisible(true);
      },

      hotkeysFilter,
    );

    // Crete folder
    useHotkeys("Shift+f", () => onCreate(null), {
      ...hotkeysFilter,
      ...{ keyup: true },
    });

    // Crete room
    useHotkeys("Shift+r", () => onCreateRoom(), {
      ...hotkeysFilter,
      ...{ keyup: true },
    });

    // Delete selection
    useHotkeys(
      "delete, shift+3, command+delete, command+Backspace",
      () => {
        if (isArchiveFolder) {
          isAvailableOption("unarchive") && deleteRooms(t);
          return;
        }

        if (isRoomsFolder) {
          isAvailableOption("archive") && archiveRooms("archive");
          return;
        }

        if (isAvailableOption("delete") && !isGroupMenuBlocked) {
          if (isRecentFolder) return;

          if (isFavoritesFolder) {
            const items = selection.map((item) => item.id);

            setFavoriteAction("remove", items)
              .then(() => toastr.success(t("RemovedFromFavorites")))
              .catch((err) => toastr.error(err));

            return;
          }

          if (confirmDelete) {
            setDeleteDialogVisible(true);
          } else {
            const translations = {
              deleteFromTrash: t("Translations:TrashItemsDeleteSuccess", {
                sectionName: t("Common:TrashSection"),
              }),
            };
            deleteAction(translations).catch((err) => toastr.error(err));
          }
        }
      },
      hotkeysFilter,
      [confirmDelete],
    );

    // //TODO: Undo the last action
    // useHotkeys(
    //   "Ctrl+z, command+z",
    //   () => alert("Undo the last action"),
    //   hotkeysFilter,
    //   []
    // );

    // //TODO: Redo the last undone action
    // useHotkeys(
    //   "Ctrl+Shift+z, command+Shift+z",
    //   () => alert("Redo the last undone action"),
    //   hotkeysFilter,
    //   []
    // );

    // Open hotkeys panel
    useHotkeys(
      "Ctrl+num_divide, Ctrl+/, command+/",
      () => setHotkeyPanelVisible(true),
      hotkeysFilter,
    );

    useHotkeys("Ctrl+c, command+c", () => copyToClipboard(t), hotkeysFilter);
    useHotkeys(
      "Ctrl+x, command+x",
      () => copyToClipboard(t, true),
      hotkeysFilter,
    );

    useHotkeys("f2", onRename, hotkeysFilter);

    // Upload file
    useHotkeys(
      "Shift+u",
      () => {
        if (folderWithNoAction) return;
        uploadFile(false, navigate, t);
      },

      hotkeysFilter,
    );

    // Upload folder
    useHotkeys(
      "Shift+i",
      () => {
        if (folderWithNoAction) return;
        uploadFile(true);
      },

      hotkeysFilter,
    );

    // Copy selected items to clipboard
    useHotkeys(
      "Ctrl+Shift+c",
      (e) => {
        if (!selection.length) return e;
        e.preventDefault();

        copySelectedText(e, viewAs, selection);
      },

      hotkeysFilter,
    );

    return <Component {...props} />;
  };

  return inject(
    ({
      settingsStore,
      filesStore,
      dialogsStore,
      filesSettingsStore,
      filesActionsStore,
      hotkeyStore,
      mediaViewerDataStore,
      treeFoldersStore,
      selectedFolderStore,
      userStore,
      indexingStore,
      currentQuotaStore,
    }) => {
      const {
        setSelected,
        viewAs,
        setViewAs,
        enabledHotkeys,
        selection,
        filesIsLoading,
      } = filesStore;

      const {
        selectFile,
        selectBottom,
        selectUpper,
        selectLeft,
        selectRight,
        multiSelectBottom,
        multiSelectUpper,
        multiSelectRight,
        multiSelectLeft,
        moveCaretBottom,
        moveCaretUpper,
        moveCaretLeft,
        moveCaretRight,
        openItem,
        selectAll,
        deselectAll,
        activateHotkeys,
        uploadFile,
        copyToClipboard,
        uploadClipboardFiles,
        enableSelection,
      } = hotkeyStore;

      const {
        setDeleteDialogVisible,
        setSelectFileDialogVisible,
        setQuotaWarningDialogVisible,
      } = dialogsStore;
      const {
        isAvailableOption,
        deleteAction,
        onClickBack,
        setFavoriteAction,
        deleteRooms,
        archiveRooms,
        isGroupMenuBlocked,
      } = filesActionsStore;

      const { visible: mediaViewerIsVisible } = mediaViewerDataStore;
      const { setHotkeyPanelVisible } = settingsStore;

      const isVisitor = userStore.user?.isVisitor;

      const {
        isFavoritesFolder,
        isRecentFolder,
        isTrashFolder,
        isArchiveFolder,
        isRoomsFolder,
      } = treeFoldersStore;

      const { isWarningRoomsDialog } = currentQuotaStore;

      const security = selectedFolderStore.security;
      const isFormRoom = selectedFolderStore.roomType === RoomsType.FormRoom;
      const isParentFolderFormRoom =
        selectedFolderStore.parentRoomType === FolderType.FormRoom;

      return {
        setSelected,
        viewAs,
        setViewAs,

        setHotkeyPanelVisible,
        setDeleteDialogVisible,
        setSelectFileDialogVisible,
        confirmDelete: filesSettingsStore.confirmDelete,
        deleteAction,
        isAvailableOption,

        selectFile,
        selectBottom,
        selectUpper,
        selectLeft,
        selectRight,
        multiSelectBottom,
        multiSelectUpper,
        multiSelectRight,
        multiSelectLeft,
        moveCaretBottom,
        moveCaretUpper,
        moveCaretLeft,
        moveCaretRight,
        openItem,
        selectAll,
        deselectAll,
        activateHotkeys,
        onClickBack,

        uploadFile,
        enabledHotkeys,
        mediaViewerIsVisible,

        isFavoritesFolder,
        isRecentFolder,
        isTrashFolder,
        isArchiveFolder,
        isRoomsFolder,
        isIndexEditingMode: indexingStore.isIndexEditingMode,

        selection,
        setFavoriteAction,
        filesIsLoading,

        isVisitor,
        deleteRooms,
        archiveRooms,

        isWarningRoomsDialog,
        setQuotaWarningDialogVisible,

        security,
        copyToClipboard,

        uploadClipboardFiles,

        isGroupMenuBlocked,
        isFormRoom,
        isParentFolderFormRoom,
        enableSelection,
      };
    },
  )(observer(WithHotkeys));
};

export default withHotkeys;
