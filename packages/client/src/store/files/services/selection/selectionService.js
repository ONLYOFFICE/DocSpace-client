import { runInAction } from "mobx";

class SelectionService {
  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  updateSelectionStatus(id, status, isEditing) {
    const index = this.rootStore.selection.findIndex((x) => x.id === id);

    if (index !== -1) {
      this.rootStore.selection[index].fileStatus = status;
      this.rootStore.selection[index].isEditing = isEditing;
    }
  }

  setSelection(selection) {
    this.rootStore.selection = selection;
  }

  setBufferSelection(bufferSelection) {
    this.rootStore.bufferSelection = bufferSelection;
  }

  removeStaleItemFromSelection(item) {
    if (!item.parentId) {
      if (this.rootStore.activeFiles.some((elem) => elem.id === item.id))
        return;
    } else if (this.rootStore.activeFolders.some((elem) => elem.id === item.id))
      return;

    if (
      this.rootStore.bufferSelection?.id === item.id &&
      this.rootStore.bufferSelection?.fileType === item.fileType
    ) {
      return this.setBufferSelection(null);
    }

    const newSelection = this.rootStore.selection.filter(
      (select) => !(select.id === item.id && select.fileType === item.fileType),
    );
    this.setSelection(newSelection);
  }

  checkSelection(file) {
    if (this.rootStore.selection) {
      const foundIndex = this.rootStore.selection?.findIndex(
        (x) => x.id === file.id,
      );
      if (foundIndex > -1) {
        runInAction(() => {
          this.rootStore.selection[foundIndex] = file;
        });
      }
    }

    if (this.rootStore.bufferSelection) {
      const foundIndex = [this.rootStore.bufferSelection].findIndex(
        (x) => x.id === file.id,
      );
      if (foundIndex > -1) {
        runInAction(() => {
          this.rootStore.bufferSelection[foundIndex] = file;
        });
      }
    }
  }
}

export default SelectionService;
