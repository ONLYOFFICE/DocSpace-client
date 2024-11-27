import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class StateManager {
  // File state
  files = new Map();
  folders = new Map();
  
  // Selection state
  selection = new Set();
  
  // View state
  viewAs = "grid";
  
  // Filter state
  currentFilter = null;
  currentRoomsFilter = null;
  currentMembersFilter = null;
  
  // Sort state
  sortBy = "name";
  sortOrder = "asc";
  
  // Display state
  itemsPerPage = 25;
  showHiddenFiles = false;
  thumbnailSize = "medium";

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // File State Management
  setFiles = (files) => {
    this.files.clear();
    files.forEach(file => {
      this.files.set(file.id, {
        ...file,
        created: new Date(file.created),
        modified: new Date(file.modified)
      });
    });
  };

  addFile = (file) => {
    this.files.set(file.id, {
      ...file,
      created: new Date(file.created),
      modified: new Date(file.modified)
    });
  };

  updateFile = (fileId, updates) => {
    const file = this.files.get(fileId);
    if (file) {
      this.files.set(fileId, {
        ...file,
        ...updates,
        modified: new Date()
      });
    }
  };

  removeFile = (fileId) => {
    this.files.delete(fileId);
  };

  // Folder State Management
  setFolders = (folders) => {
    this.folders.clear();
    folders.forEach(folder => {
      this.folders.set(folder.id, {
        ...folder,
        created: new Date(folder.created),
        modified: new Date(folder.modified)
      });
    });
  };

  addFolder = (folder) => {
    this.folders.set(folder.id, {
      ...folder,
      created: new Date(folder.created),
      modified: new Date(folder.modified)
    });
  };

  updateFolder = (folderId, updates) => {
    const folder = this.folders.get(folderId);
    if (folder) {
      this.folders.set(folderId, {
        ...folder,
        ...updates,
        modified: new Date()
      });
    }
  };

  removeFolder = (folderId) => {
    this.folders.delete(folderId);
  };

  // Selection State Management
  setSelection = (items) => {
    this.selection.clear();
    items.forEach(item => this.selection.add(item));
  };

  addToSelection = (item) => {
    this.selection.add(item);
  };

  removeFromSelection = (item) => {
    this.selection.delete(item);
  };

  clearSelection = () => {
    this.selection.clear();
  };

  // View State Management
  setViewAs = (view) => {
    if (["grid", "list", "table"].includes(view)) {
      this.viewAs = view;
    }
  };

  // Filter State Management
  setFilter = (filter) => {
    this.currentFilter = filter;
  };

  setRoomsFilter = (filter) => {
    this.currentRoomsFilter = filter;
  };

  setMembersFilter = (filter) => {
    this.currentMembersFilter = filter;
  };

  // Sort State Management
  setSorting = (by, order) => {
    this.sortBy = by;
    this.sortOrder = order;
  };

  // Display State Management
  setItemsPerPage = (count) => {
    this.itemsPerPage = count;
  };

  setShowHiddenFiles = (show) => {
    this.showHiddenFiles = show;
  };

  setThumbnailSize = (size) => {
    if (["small", "medium", "large"].includes(size)) {
      this.thumbnailSize = size;
    }
  };

  // Computed Values
  get allItems() {
    return [...Array.from(this.files.values()), ...Array.from(this.folders.values())];
  }

  get selectedItems() {
    return Array.from(this.selection);
  }

  get filteredItems() {
    let items = this.allItems;
    
    if (this.currentFilter) {
      items = items.filter(item => this.currentFilter(item));
    }
    
    if (!this.showHiddenFiles) {
      items = items.filter(item => !item.isHidden);
    }
    
    return this.sortItems(items);
  }

  // Helper Methods
  sortItems = (items) => {
    return items.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "modified":
          comparison = a.modified - b.modified;
          break;
        case "created":
          comparison = a.created - b.created;
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        default:
          comparison = 0;
      }
      
      return this.sortOrder === "asc" ? comparison : -comparison;
    });
  };

  resetToDefaults = () => {
    this.viewAs = "grid";
    this.currentFilter = null;
    this.currentRoomsFilter = null;
    this.currentMembersFilter = null;
    this.sortBy = "name";
    this.sortOrder = "asc";
    this.itemsPerPage = 25;
    this.showHiddenFiles = false;
    this.thumbnailSize = "medium";
    this.clearSelection();
  };

  clearAll = () => {
    this.files.clear();
    this.folders.clear();
    this.resetToDefaults();
  };
}

export default StateManager;
