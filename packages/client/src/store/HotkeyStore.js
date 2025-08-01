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

import { makeAutoObservable } from "mobx";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { RoomsType } from "@docspace/shared/enums";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";

import { toastr } from "@docspace/shared/components/toast";
import { isMobile, getCountTilesInRow } from "@docspace/shared/utils";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";

import config from "PACKAGE_FILE";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { TABLE_HEADER_HEIGHT } from "@docspace/shared/components/table/Table.constants";
import { encryptionUploadDialog } from "../helpers/encryptionUploadDialog";

class HotkeyStore {
  filesStore;

  dialogsStore;

  filesSettingsStore;

  filesActionsStore;

  treeFoldersStore;

  uploadDataStore;

  selectedFolderStore;

  indexingStore;

  elemOffset = 0;

  hotkeysClipboardAction = null;

  constructor(
    filesStore,
    dialogsStore,
    filesSettingsStore,
    filesActionsStore,
    treeFoldersStore,
    uploadDataStore,
    selectedFolderStore,
    indexingStore,
  ) {
    makeAutoObservable(this);
    this.filesStore = filesStore;
    this.dialogsStore = dialogsStore;
    this.filesSettingsStore = filesSettingsStore;
    this.filesActionsStore = filesActionsStore;
    this.treeFoldersStore = treeFoldersStore;
    this.uploadDataStore = uploadDataStore;
    this.selectedFolderStore = selectedFolderStore;
    this.indexingStore = indexingStore;
  }

  scrollToCaret = () => {
    const { offsetTop, item } = this.getItemOffset();

    const scroll = isMobile()
      ? document.querySelector("#customScrollBar > .scroll-wrapper > .scroller")
      : document.getElementsByClassName("section-scroll")[0];

    const stickySection = document.querySelector(".section-sticky-container");
    const stickySectionHeight =
      stickySection?.getBoundingClientRect().height ?? 0;

    const tableHeaderHeight =
      this.filesStore.viewAs === "table" ? TABLE_HEADER_HEIGHT : 0;

    const scrollRect = scroll?.getBoundingClientRect();

    if (item && item[0]) {
      const el = item[0];
      const rect = el.getBoundingClientRect();

      if (
        scrollRect.top + scrollRect.height - rect.height > rect.top &&
        scrollRect.top + stickySectionHeight + tableHeaderHeight < rect.top
      ) {
        // console.log("element is visible");
      } else {
        scroll.scrollTo(0, offsetTop - scrollRect.height / 2);
        // console.log("element is not visible");
      }
    } else {
      scroll?.scrollTo(0, this.elemOffset - scrollRect.height / 2);
    }
  };

  activateHotkeys = (e) => {
    const infiniteLoaderComponent = document.getElementsByClassName(
      "ReactVirtualized__List",
    )[0];

    if (infiniteLoaderComponent) {
      infiniteLoaderComponent.tabIndex = -1;
    }

    const { isViewerOpen } = this.filesActionsStore.mediaViewerDataStore;

    const someDialogIsOpen = checkDialogsOpen() || isViewerOpen;

    if (
      someDialogIsOpen ||
      (e.target?.tagName === "INPUT" && e.target.type !== "checkbox") ||
      e.target?.tagName === "TEXTAREA"
    )
      return e;

    const isDefaultKeys =
      ["PageUp", "PageDown", "Home", "End", "KeyV"].indexOf(e.code) > -1;

    const { selection: s, hotkeyCaret, filesList } = this.filesStore;
    const selection = s.length ? s : filesList;

    if (!hotkeyCaret) {
      const scroll = document.getElementsByClassName("section-scroll");
      scroll && scroll[0] && scroll[0]?.firstChild.focus();
    }

    if (!hotkeyCaret && selection.length) {
      this.setCaret(selection[0], !(e.ctrlKey || e.metaKey || e.shiftKey));
      this.filesStore.setHotkeyCaretStart(selection[0]);
    }

    if (!hotkeyCaret || isDefaultKeys) return e;

    e.preventDefault();
  };

  setCaret = (caret, withScroll = true) => {
    // TODO: inf-scroll
    // const id = caret.isFolder ? `folder_${caret.id}` : `file_${caret.id}`;
    // const elem = document.getElementById(id);
    // if (!elem) return;

    this.filesStore.setHotkeyCaret(caret);
    withScroll && this.scrollToCaret();

    const { offsetTop } = this.getItemOffset();
    if (offsetTop) this.elemOffset = offsetTop;
  };

  getItemOffset = () => {
    const { hotkeyCaret, viewAs } = this.filesStore;

    const className = hotkeyCaret.fileExst
      ? `${hotkeyCaret.id}_${hotkeyCaret.fileExst}`
      : `${hotkeyCaret.id}`;

    let item = document.getElementsByClassName(className);

    if (viewAs === "table") {
      item = item && item[0]?.getElementsByClassName("table-container_cell");
    }

    if (item && item[0]) {
      const el = item[0];

      const offset = el.closest(".window-item")?.offsetTop;

      const offsetTop =
        offset ||
        (viewAs === "tile"
          ? el.parentElement.parentElement.offsetTop
          : el.offsetTop);

      return { offsetTop, item };
    }

    return { offsetTop: null, item: null };
  };

  selectFirstFile = () => {
    const { filesList } = this.filesStore;

    if (filesList.length) {
      // scroll to first element
      const scroll = isMobile()
        ? document.querySelector(
            "#customScrollBar > .scroll-wrapper > .scroller",
          )
        : document.getElementsByClassName("section-scroll")[0];

      scroll?.scrollTo(0, 0);

      this.filesStore.setSelection([filesList[0]]);
      this.setCaret(filesList[0]);
      this.filesStore.setHotkeyCaretStart(filesList[0]);
    }
  };

  setSelectionWithCaret = (selection) => {
    this.filesStore.setSelection(selection);
    this.setCaret(selection[0]);
    this.filesStore.setHotkeyCaretStart(selection[0]);
  };

  selectFile = () => {
    const { selection, setSelection, hotkeyCaret, setHotkeyCaretStart } =
      this.filesStore;

    const index = selection.findIndex(
      (f) => f.id === hotkeyCaret?.id && f.isFolder === hotkeyCaret?.isFolder,
    );
    if (index !== -1) {
      const newSelection = selection;
      newSelection.splice(index, 1);
      setSelection(newSelection);
    } else if (hotkeyCaret) {
      const newSelection = selection;
      newSelection.push(hotkeyCaret);
      setSelection(newSelection);
      setHotkeyCaretStart(hotkeyCaret);
    } else if (selection.length) {
      this.setCaret(selection[0]);
      setHotkeyCaretStart(selection[0]);
    } else this.selectFirstFile();
  };

  selectBottom = () => {
    const { viewAs, hotkeyCaret, selection } = this.filesStore;

    if (!hotkeyCaret && !selection.length) return this.selectFirstFile();
    if (viewAs === "tile") this.setSelectionWithCaret([this.nextForTileDown]);
    else if (this.nextFile) this.setSelectionWithCaret([this.nextFile]);
  };

  selectUpper = () => {
    const { hotkeyCaret, viewAs, selection } = this.filesStore;

    if (!hotkeyCaret && !selection.length) return this.selectFirstFile();
    if (viewAs === "tile") this.setSelectionWithCaret([this.prevForTileUp]);
    else if (this.prevFile) this.setSelectionWithCaret([this.prevFile]);
  };

  selectLeft = () => {
    const { hotkeyCaret, filesList, setHotkeyCaretStart, selection, viewAs } =
      this.filesStore;
    if (viewAs !== "tile") return;

    if (!hotkeyCaret && !selection.length) {
      this.selectFirstFile();

      setHotkeyCaretStart(filesList[0]);
    } else if (this.prevFile) {
      this.setSelectionWithCaret([this.prevFile]);
    }
  };

  selectRight = () => {
    const { hotkeyCaret, filesList, setHotkeyCaretStart, selection, viewAs } =
      this.filesStore;
    if (viewAs !== "tile") return;

    if (!hotkeyCaret && !selection.length) {
      this.selectFirstFile();
      setHotkeyCaretStart(filesList[0]);
    } else if (this.nextFile) {
      this.setSelectionWithCaret([this.nextFile]);
    }
  };

  multiSelectBottom = () => {
    const {
      selection,
      setSelection,
      hotkeyCaretStart,
      setHotkeyCaretStart,
      hotkeyCaret,
      viewAs,
      deselectFile,
      filesList,
    } = this.filesStore;

    if (!hotkeyCaretStart) {
      setHotkeyCaretStart(hotkeyCaret);
    }
    if (!hotkeyCaret && !selection.length) return this.selectFirstFile();

    if (viewAs === "tile") {
      if (
        this.nextForTileDown.id === hotkeyCaret.id &&
        this.nextForTileDown.isFolder === hotkeyCaret.isFolder
      )
        return;

      setSelection(this.selectionsDown);
      this.setCaret(this.nextForTileDown);
    } else if (this.nextFile) {
      if (selection.findIndex((f) => f.id === this.nextFile.id) !== -1) {
        const startIndex = filesList.findIndex(
          (f) =>
            f.id === hotkeyCaretStart.id &&
            f.isFolder === hotkeyCaretStart.isFolder,
        );

        if (startIndex > this.caretIndex) {
          deselectFile(hotkeyCaret);
        }
      } else {
        setSelection([...selection, ...[this.nextFile]]);
      }
      this.setCaret(this.nextFile);
    }
  };

  multiSelectUpper = () => {
    const {
      selection,
      setSelection,
      hotkeyCaretStart,
      setHotkeyCaretStart,
      hotkeyCaret,
      viewAs,
      deselectFile,
      filesList,
    } = this.filesStore;

    if (!hotkeyCaretStart) {
      setHotkeyCaretStart(hotkeyCaret);
    }
    if (!hotkeyCaret && !selection.length) this.selectFirstFile();

    if (viewAs === "tile") {
      if (
        this.prevForTileUp.id === hotkeyCaret.id &&
        this.prevForTileUp.isFolder === hotkeyCaret.isFolder
      )
        return;

      setSelection(this.selectionsUp);
      this.setCaret(this.prevForTileUp);
    } else if (this.prevFile) {
      if (
        selection.findIndex(
          (f) =>
            f.id === this.prevFile.id && f.isFolder === this.prevFile.isFolder,
        ) !== -1
      ) {
        const startIndex = filesList.findIndex(
          (f) =>
            f.id === hotkeyCaretStart.id &&
            f.isFolder === hotkeyCaretStart.isFolder,
        );

        if (startIndex < this.caretIndex) {
          deselectFile(hotkeyCaret);
        }
      } else {
        setSelection([...[this.prevFile], ...selection]);
      }

      this.setCaret(this.prevFile);
    }
  };

  multiSelectRight = () => {
    const {
      selection,
      setSelection,
      hotkeyCaret,
      viewAs,
      hotkeyCaretStart,
      filesList,
    } = this.filesStore;
    if (viewAs !== "tile") return;

    if (!hotkeyCaret && !selection.length) return this.selectFirstFile();

    const nextFile = this.nextFile;
    if (!nextFile) return;

    const hotkeyCaretStartIndex = filesList.findIndex(
      (f) =>
        f.id === hotkeyCaretStart?.id &&
        f.isFolder === hotkeyCaretStart?.isFolder,
    );

    const nextCaretIndex = this.caretIndex + 1;
    let nextForTileRight = selection;

    let iNext = hotkeyCaretStartIndex;
    if (iNext < nextCaretIndex) {
      while (iNext !== nextCaretIndex + 1) {
        if (filesList[iNext]) {
          if (
            nextForTileRight.findIndex(
              (f) =>
                f.id === filesList[iNext].id &&
                f.isFolder === filesList[iNext].isFolder,
            ) !== -1
          ) {
            nextForTileRight.filter(
              (f) =>
                f.id === filesList[iNext].id &&
                f.isFolder === filesList[iNext].isFolder,
            );
          } else {
            nextForTileRight.push(filesList[iNext]);
          }
        }
        iNext++;
      }
    }

    if (this.caretIndex < hotkeyCaretStartIndex) {
      const idx = nextForTileRight.findIndex(
        (f) => f.id === hotkeyCaret.id && f.isFolder === hotkeyCaret.isFolder,
      );
      nextForTileRight = nextForTileRight.filter((_, index) => index !== idx);
    }

    setSelection(nextForTileRight);

    this.setCaret(nextFile);
  };

  multiSelectLeft = () => {
    const {
      selection,
      setSelection,
      hotkeyCaret,
      viewAs,
      filesList,
      hotkeyCaretStart,
    } = this.filesStore;
    if (viewAs !== "tile") return;

    if (!hotkeyCaret && !selection.length) return this.selectFirstFile();

    const prevFile = this.prevFile;
    if (!prevFile) return;

    const hotkeyCaretStartIndex = filesList.findIndex(
      (f) =>
        f.id === hotkeyCaretStart?.id &&
        f.isFolder === hotkeyCaretStart?.isFolder,
    );

    const prevCaretIndex = this.caretIndex - 1;
    let prevForTileLeft = selection;

    let iPrev = hotkeyCaretStartIndex;
    if (iPrev > prevCaretIndex) {
      while (iPrev !== prevCaretIndex - 1) {
        if (filesList[iPrev]) {
          if (
            prevForTileLeft.findIndex(
              (f) =>
                f.id === filesList[iPrev].id &&
                f.isFolder === filesList[iPrev].isFolder,
            ) !== -1
          ) {
            prevForTileLeft.filter(
              (f) =>
                f.id === filesList[iPrev].id &&
                f.isFolder === filesList[iPrev].isFolder,
            );
          } else {
            prevForTileLeft.push(filesList[iPrev]);
          }
        }
        iPrev--;
      }
    }

    if (this.caretIndex > hotkeyCaretStartIndex) {
      const idx = prevForTileLeft.findIndex(
        (f) => f.id === hotkeyCaret.id && f.isFolder === hotkeyCaret.isFolder,
      );
      prevForTileLeft = prevForTileLeft.filter((_, index) => index !== idx);
    }

    setSelection(prevForTileLeft);
    this.setCaret(prevFile);
  };

  moveCaretBottom = () => {
    const { viewAs } = this.filesStore;

    if (viewAs === "tile") this.setCaret(this.nextForTileDown);
    else if (this.nextFile) this.setCaret(this.nextFile);
  };

  moveCaretUpper = () => {
    const { viewAs } = this.filesStore;

    if (viewAs === "tile") this.setCaret(this.prevForTileUp);
    else if (this.prevFile) this.setCaret(this.prevFile);
  };

  moveCaretLeft = () => {
    if (this.prevFile) this.setCaret(this.prevFile);
  };

  moveCaretRight = () => {
    if (this.nextFile) this.setCaret(this.nextFile);
  };

  openItem = (t) => {
    const { selection } = this.filesStore;

    const someDialogIsOpen = checkDialogsOpen();

    selection.length === 1 &&
      !someDialogIsOpen &&
      this.filesActionsStore.openFileAction(selection[0], t);
  };

  selectAll = () => {
    const { filesList, hotkeyCaret, setHotkeyCaretStart, setSelected } =
      this.filesStore;

    setSelected("all");
    if (!hotkeyCaret && filesList.length) {
      this.setCaret(filesList[0]);
      setHotkeyCaretStart(filesList[0]);
    }
  };

  deselectAll = () => {
    const { setSelected } = this.filesStore;
    const { revokeFilesOrder } = this.filesActionsStore;
    const { isIndexEditingMode, setIsIndexEditingMode } = this.indexingStore;

    if (isIndexEditingMode) {
      revokeFilesOrder();
      setIsIndexEditingMode(false);

      return;
    }

    this.elemOffset = 0;
    setSelected("none");
  };

  goToHomePage = (navigate) => {
    const { filter, categoryType } = this.filesStore;

    const filterParamsStr = filter.toUrlParams();

    const url = getCategoryUrl(categoryType, filter.folder);

    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `${url}?${filterParamsStr}`,
      ),
    );
  };

  uploadFile = (isFolder, navigate, t) => {
    if (isFolder) {
      if (this.treeFoldersStore.isPrivacyFolder) return;
      const folderInput = document.getElementById("customFolderInput");
      folderInput && folderInput.click();
    } else if (this.treeFoldersStore.isPrivacyFolder) {
      encryptionUploadDialog(
        this.filesSettingsStore.extsWebEncrypt,
        (encryptedFile, encrypted) => {
          encryptedFile.encrypted = encrypted;
          this.goToHomePage(navigate);
          this.uploadDataStore.startUpload([encryptedFile], null, t);
        },
      );
    } else {
      const fileInput = document.getElementById("customFileInput");
      fileInput && fileInput.click();
    }
  };

  copyToClipboard = (t, isCut) => {
    const { selection, setHotkeysClipboard } = this.filesStore;

    const canCopy = selection.every((s) => s.security?.Copy);
    const canMove = selection.every((s) => s.security?.Move);

    if (!canCopy || (isCut && !canMove) || !selection.length) return;

    setHotkeysClipboard();
    this.hotkeysClipboardAction = isCut ? "move" : "copy";

    const copyText = `${t("AddedToClipboard")}: ${selection.length}`;
    toastr.success(copyText);
  };

  moveFilesFromClipboard = (t) => {
    const fileIds = [];
    const folderIds = [];

    const {
      id: selectedItemId,
      roomType,
      security,
      getSelectedFolder,
    } = this.selectedFolderStore;
    const { activeFiles, activeFolders, hotkeysClipboard } = this.filesStore;
    const { checkFileConflicts, setSelectedItems, setConflictDialogData } =
      this.filesActionsStore;
    const { itemOperationToFolder, clearActiveOperations } =
      this.uploadDataStore;

    const isCopy = this.hotkeysClipboardAction === "copy";
    const selections = isCopy
      ? hotkeysClipboard
      : hotkeysClipboard.filter((f) => f && !f?.isEditing);

    if (!selections.length) return;

    if (!security.CopyTo || !security.MoveTo) return;

    const isPublic = roomType === RoomsType.PublicRoom;

    selections.forEach((item) => {
      if (item.fileExst || item.contentLength) {
        const fileInAction = activeFiles.includes(item.id);
        if (!fileInAction) {
          fileIds.push(item.id);
        }
      } else if (item.id === selectedItemId) {
        toastr.error(t("Common:MoveToFolderMessage"));
      } else {
        const folderInAction = activeFolders.includes(item.id);

        if (!folderInAction) {
          folderIds.push(item.id);
        }
      }
    });

    const itemsLength = folderIds.length + fileIds.length;

    if (folderIds.length || fileIds.length) {
      const operationData = {
        destFolderId: selectedItemId,
        destFolderInfo: getSelectedFolder(),
        folderIds,
        fileIds,
        deleteAfter: false,
        isCopy,
        itemsCount: itemsLength,
        ...(itemsLength === 1 && {
          title: selections[0].title,
          isFolder: selections[0].isFolder,
        }),
      };

      if (isPublic && !selections.rootFolderType) {
        this.dialogsStore.setMoveToPublicRoomVisible(true, operationData);
        return;
      }

      const fileTitle = hotkeysClipboard.find((f) => f.title)?.title;
      setSelectedItems(fileTitle, hotkeysClipboard.length);

      checkFileConflicts(selectedItemId, folderIds, fileIds)
        .then(async (conflicts) => {
          if (conflicts.length) {
            setConflictDialogData(conflicts, operationData);
          } else {
            if (!isCopy) this.filesStore.setMovingInProgress(!isCopy);

            await itemOperationToFolder(operationData);
          }
        })
        .catch(() => {
          clearActiveOperations(fileIds, folderIds);
        })
        .finally(() => {
          this.filesStore.setHotkeysClipboard([]);
        });
    } else {
      toastr.error(t("Common:ErrorEmptyList"));
    }
  };

  uploadClipboardFiles = async (t, event) => {
    const { createFoldersTree } = this.filesActionsStore;
    const { startUpload } = this.uploadDataStore;

    // Return early if the event target is an input or textarea element
    if (
      event &&
      event.target &&
      (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")
    ) {
      return;
    }

    if (this.filesStore.hotkeysClipboard.length) {
      return this.moveFilesFromClipboard(t);
    }

    const files = await getFilesFromEvent(event);

    createFoldersTree(t, files)
      .then((f) => {
        if (f.length > 0) startUpload(f, null, t);
      })
      .catch((err) => {
        toastr.error(err, null, 0, true);
      });
  };

  get countTilesInRow() {
    return getCountTilesInRow(this.treeFoldersStore?.isRoomsFolder);
  }

  get division() {
    const { folders } = this.filesStore;
    return folders.length % this.countTilesInRow;
  }

  get countOfMissingFiles() {
    return this.division ? this.countTilesInRow - this.division : 0;
  }

  get caretIsFolder() {
    const { filesList } = this.filesStore;

    if (this.caretIndex !== -1) {
      return filesList[this.caretIndex]?.isFolder;
    }
    return false;
  }

  get caretIndex() {
    const { filesList, hotkeyCaret, selection } = this.filesStore;

    const item =
      hotkeyCaret ||
      (selection.length
        ? selection.length === 1
          ? selection[0]
          : selection[selection.length - 1]
        : null);

    const caretIndex = filesList.findIndex(
      (f) => f.id === item?.id && f.isFolder === item?.isFolder,
    );

    if (caretIndex !== -1) return caretIndex;
    return null;
  }

  get nextFile() {
    const { filesList } = this.filesStore;

    if (this.caretIndex !== -1) {
      const nextCaretIndex = this.caretIndex + 1;
      return filesList[nextCaretIndex];
    }
    return null;
  }

  get nextForTileDown() {
    const { filesList, folders, files } = this.filesStore;
    const nextTileFile = filesList[this.caretIndex + this.countTilesInRow];
    const foldersLength = folders.length;

    let nextForTileDown = nextTileFile || filesList[filesList.length - 1];

    // Next tile

    if (nextForTileDown.isFolder !== this.caretIsFolder) {
      const indexForNextTile =
        this.caretIndex + this.countTilesInRow - this.countOfMissingFiles;

      nextForTileDown =
        foldersLength - this.caretIndex - 1 <= this.division ||
        this.division === 0
          ? filesList[indexForNextTile]
            ? filesList[indexForNextTile]
            : files[0]
          : folders[foldersLength - 1];
    } else if (!nextTileFile) {
      // const pp = filesList.findIndex((f) => f.id === nextForTileDown?.id);
      // if (pp < this.caretIndex + this.countTilesInRow) {
      //   nextForTileDown = hotkeyCaret;
      // }
    }

    if (nextForTileDown.isFolder === undefined) {
      nextForTileDown.isFolder = !!nextForTileDown.parentId;
    }

    return nextForTileDown;
  }

  get prevFile() {
    const { filesList } = this.filesStore;

    if (this.caretIndex !== -1) {
      const prevCaretIndex = this.caretIndex - 1;
      return filesList[prevCaretIndex];
    }
    return null;
  }

  get prevForTileUp() {
    const { filesList, folders, hotkeyCaret } = this.filesStore;
    const foldersLength = folders.length;

    const prevTileFile = filesList[this.caretIndex - this.countTilesInRow];
    let prevForTileUp = prevTileFile || filesList[0];

    if (prevForTileUp.isFolder !== this.caretIsFolder) {
      const indexForPrevTile =
        this.caretIndex - this.countTilesInRow + this.countOfMissingFiles;

      prevForTileUp = filesList[indexForPrevTile]
        ? filesList[indexForPrevTile].isFolder
          ? filesList[indexForPrevTile]
          : folders[foldersLength - 1]
        : folders[foldersLength - 1];
    } else if (!prevTileFile) {
      prevForTileUp = hotkeyCaret;
    }

    if (prevForTileUp.isFolder === undefined) {
      prevForTileUp.isFolder = !!prevForTileUp.parentId;
    }

    return prevForTileUp;
  }

  get selectionsDown() {
    const { filesList, hotkeyCaretStart, viewAs, selection } = this.filesStore;
    let selectionsDown = JSON.parse(JSON.stringify(selection));

    const hotkeyCaretStartIndex = filesList.findIndex(
      (f) =>
        f.id === hotkeyCaretStart?.id &&
        f.isFolder === hotkeyCaretStart?.isFolder,
    );

    const firstSelectionIndex = filesList.findIndex(
      (f) => f.id === selection[0]?.id && f.isFolder === selection[0]?.isFolder,
    );

    const nextForTileDownIndex = filesList.findIndex(
      (f) =>
        f.id === this.nextForTileDown?.id &&
        f.isFolder === this.nextForTileDown?.isFolder,
    );

    let nextForTileDownItemIndex = nextForTileDownIndex;

    const itemIndexDown =
      hotkeyCaretStartIndex !== -1 &&
      hotkeyCaretStartIndex < firstSelectionIndex
        ? hotkeyCaretStartIndex
        : firstSelectionIndex;

    if (itemIndexDown !== -1 && viewAs === "tile") {
      if (nextForTileDownItemIndex === -1) {
        nextForTileDownItemIndex = itemIndexDown + this.countTilesInRow;
      }

      let itemIndex = this.caretIndex;

      while (itemIndex !== nextForTileDownItemIndex) {
        const fileIndex = selectionsDown.findIndex(
          (f) =>
            f.id === filesList[itemIndex].id &&
            f.isFolder === filesList[itemIndex].isFolder,
        );

        if (fileIndex === -1) {
          selectionsDown.push(filesList[itemIndex]);
        } else if (hotkeyCaretStartIndex > itemIndex) {
          selectionsDown = selectionsDown.filter(
            (_, index) => index !== fileIndex,
          );
        }

        itemIndex++;
      }

      if (
        selectionsDown.findIndex(
          (f) =>
            f.id === this.nextForTileDown.id &&
            f.isFolder === this.nextForTileDown.isFolder,
        ) === -1
      ) {
        selectionsDown.push(this.nextForTileDown);
      }
    }

    return selectionsDown;
  }

  get selectionsUp() {
    const { filesList, viewAs, selection, hotkeyCaretStart } = this.filesStore;

    let selectionsUp = JSON.parse(JSON.stringify(selection));

    const hotkeyCaretStartIndex = filesList.findIndex(
      (f) =>
        f.id === hotkeyCaretStart?.id &&
        f.isFolder === hotkeyCaretStart?.isFolder,
    );

    const firstSelectionIndex = filesList.findIndex(
      (f) => f.id === selection[0]?.id && f.isFolder === selection[0]?.isFolder,
    );

    const prevForTileUpIndex = filesList.findIndex(
      (f) =>
        f.id === this.prevForTileUp?.id &&
        f.isFolder === this.prevForTileUp?.isFolder,
    );
    let prevForTileUpItemIndex = prevForTileUpIndex;

    const itemIndexUp =
      hotkeyCaretStartIndex !== -1 &&
      hotkeyCaretStartIndex > firstSelectionIndex
        ? hotkeyCaretStartIndex
        : firstSelectionIndex;

    if (itemIndexUp !== -1 && viewAs === "tile") {
      if (prevForTileUpItemIndex === -1) {
        prevForTileUpItemIndex = itemIndexUp - this.countTilesInRow;
      }

      let itemIndex = this.caretIndex;

      while (itemIndex !== prevForTileUpItemIndex) {
        const fileIndex = selectionsUp.findIndex(
          (f) =>
            f.id === filesList[itemIndex].id &&
            f.isFolder === filesList[itemIndex].isFolder,
        );

        if (fileIndex === -1) {
          selectionsUp.push(filesList[itemIndex]);
        } else if (hotkeyCaretStartIndex < itemIndex) {
          selectionsUp = selectionsUp.filter((_, index) => index !== fileIndex);
        }

        itemIndex--;
      }

      if (
        selectionsUp.findIndex(
          (f) =>
            f.id === this.prevForTileUp.id &&
            f.isFolder === this.prevForTileUp.isFolder,
        ) === -1
      ) {
        selectionsUp.push(this.prevForTileUp);
      }
    }

    return selectionsUp;
  }
}

export default HotkeyStore;
