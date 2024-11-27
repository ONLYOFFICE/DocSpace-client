import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class MetadataManager {
  metadata = new Map();
  tags = new Set();
  customFields = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  fetchMetadata = async (fileId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `fetch-metadata-${fileId}`,
        () => api.files.getMetadata(fileId)
      );

      this.setMetadata(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch metadata");
      throw err;
    }
  };

  updateMetadata = async (fileId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `update-metadata-${fileId}`,
        () => api.files.updateMetadata(fileId, updates)
      );

      this.setMetadata(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update metadata");
      throw err;
    }
  };

  addTag = async (fileId, tag) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `add-tag-${fileId}`,
        () => api.files.addTag(fileId, tag)
      );

      this.tags.add(tag);
      this.setMetadata(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Add tag");
      throw err;
    }
  };

  removeTag = async (fileId, tag) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `remove-tag-${fileId}`,
        () => api.files.removeTag(fileId, tag)
      );

      // Only remove tag if it's not used by any other files
      const isTagUsed = [...this.metadata.values()].some(
        meta => meta.tags?.includes(tag)
      );
      if (!isTagUsed) {
        this.tags.delete(tag);
      }

      this.setMetadata(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Remove tag");
      throw err;
    }
  };

  addCustomField = async (fileId, field) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `add-custom-field-${fileId}`,
        () => api.files.addCustomField(fileId, field)
      );

      this.customFields.set(field.key, field);
      this.setMetadata(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Add custom field");
      throw err;
    }
  };

  removeCustomField = async (fileId, fieldKey) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        `remove-custom-field-${fileId}`,
        () => api.files.removeCustomField(fileId, fieldKey)
      );

      // Only remove field if it's not used by any other files
      const isFieldUsed = [...this.metadata.values()].some(
        meta => meta.customFields?.some(field => field.key === fieldKey)
      );
      if (!isFieldUsed) {
        this.customFields.delete(fieldKey);
      }

      this.setMetadata(fileId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Remove custom field");
      throw err;
    }
  };

  setMetadata = (fileId, metadata) => {
    this.metadata.set(fileId, metadata);

    // Update tags
    metadata.tags?.forEach(tag => this.tags.add(tag));

    // Update custom fields
    metadata.customFields?.forEach(field => 
      this.customFields.set(field.key, field)
    );
  };

  getMetadata = (fileId) => {
    return this.metadata.get(fileId);
  };

  clearMetadata = (fileId) => {
    this.metadata.delete(fileId);
  };

  get allTags() {
    return Array.from(this.tags);
  }

  get allCustomFields() {
    return Array.from(this.customFields.values());
  }

  clearAll = () => {
    this.metadata.clear();
    this.tags.clear();
    this.customFields.clear();
  };
}

export default MetadataManager;
