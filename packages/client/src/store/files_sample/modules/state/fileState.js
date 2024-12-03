import { makeAutoObservable } from "mobx";
import { FileType, FolderType } from "@docspace/shared/enums";

export class FileState {
  files = [];
  folders = [];
  isUpdatingRowItem = false;

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  setFiles = (files) => {
    this.files = files;
  };

  setFolders = (folders) => {
    this.folders = folders;
  };

  addFile = (file) => {
    this.files.push(file);
  };

  removeFile = (fileId) => {
    this.files = this.files.filter(file => file.id !== fileId);
  };

  updateFile = (fileId, updates) => {
    const fileIndex = this.files.findIndex(file => file.id === fileId);
    if (fileIndex !== -1) {
      this.files[fileIndex] = { ...this.files[fileIndex], ...updates };
    }
  };

  get allItems() {
    return [...this.folders, ...this.files];
  }

  get totalCount() {
    return this.files.length + this.folders.length;
  }
}

export default FileState;
