import { makeAutoObservable } from "mobx";

export class SelectionState {
  selection = [];
  bufferSelection = null;
  selected = "close";
  hotkeyCaret = null;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  setSelection = (items) => {
    this.selection = items;
  };

  addToSelection = (item) => {
    if (!this.selection.find(selected => selected.id === item.id)) {
      this.selection.push(item);
    }
  };

  removeFromSelection = (itemId) => {
    this.selection = this.selection.filter(item => item.id !== itemId);
  };

  clearSelection = () => {
    this.selection = [];
    this.selected = "close";
  };

  setBufferSelection = (item) => {
    this.bufferSelection = item;
  };

  clearBufferSelection = () => {
    this.bufferSelection = null;
  };

  setHotkeyCaret = (caret) => {
    this.hotkeyCaret = caret;
  };

  get hasSelection() {
    return this.selection.length > 0;
  }

  get selectedIds() {
    return this.selection.map(item => item.id);
  }
}

export default SelectionState;
