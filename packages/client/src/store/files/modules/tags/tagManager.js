import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class TagManager {
  tags = new Map();
  tagCategories = new Map();
  selectedTags = new Set();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchTags = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-tags",
        () => api.files.getTags()
      );
      this.setTags(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch tags");
      throw err;
    }
  };

  fetchTagCategories = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-tag-categories",
        () => api.files.getTagCategories()
      );
      this.setTagCategories(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch tag categories");
      throw err;
    }
  };

  createTag = async (tagData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-tag",
        () => api.files.createTag(tagData)
      );
      this.addTag(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create tag");
      throw err;
    }
  };

  updateTag = async (tagId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-tag",
        () => api.files.updateTag(tagId, updates)
      );
      this.updateTagInStore(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update tag");
      throw err;
    }
  };

  deleteTag = async (tagId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-tag",
        () => api.files.deleteTag(tagId)
      );
      this.removeTag(tagId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete tag");
      throw err;
    }
  };

  addTagToFile = async (fileId, tagId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "add-file-tag",
        () => api.files.addTagToFile(fileId, tagId)
      );
      await this.rootStore.folderManager.refreshFolder();
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Add tag to file");
      throw err;
    }
  };

  removeTagFromFile = async (fileId, tagId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "remove-file-tag",
        () => api.files.removeTagFromFile(fileId, tagId)
      );
      await this.rootStore.folderManager.refreshFolder();
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Remove tag from file");
      throw err;
    }
  };

  getFilesByTag = async (tagId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "get-files-by-tag",
        () => api.files.getFilesByTag(tagId)
      );
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Get files by tag");
      throw err;
    }
  };

  // Local state management
  setTags = (tags) => {
    this.tags.clear();
    tags.forEach(tag => {
      this.tags.set(tag.id, tag);
    });
  };

  setTagCategories = (categories) => {
    this.tagCategories.clear();
    categories.forEach(category => {
      this.tagCategories.set(category.id, category);
    });
  };

  addTag = (tag) => {
    this.tags.set(tag.id, tag);
  };

  updateTagInStore = (updatedTag) => {
    this.tags.set(updatedTag.id, updatedTag);
  };

  removeTag = (tagId) => {
    this.tags.delete(tagId);
    this.selectedTags.delete(tagId);
  };

  selectTag = (tagId) => {
    this.selectedTags.add(tagId);
  };

  unselectTag = (tagId) => {
    this.selectedTags.delete(tagId);
  };

  clearSelectedTags = () => {
    this.selectedTags.clear();
  };

  // Computed values
  get tagList() {
    return Array.from(this.tags.values());
  }

  get categoryList() {
    return Array.from(this.tagCategories.values());
  }

  get selectedTagList() {
    return Array.from(this.selectedTags).map(tagId => this.tags.get(tagId));
  }

  getTag = (tagId) => {
    return this.tags.get(tagId);
  };

  getTagCategory = (categoryId) => {
    return this.tagCategories.get(categoryId);
  };

  clearAll = () => {
    this.tags.clear();
    this.tagCategories.clear();
    this.selectedTags.clear();
  };
}

export default TagManager;
