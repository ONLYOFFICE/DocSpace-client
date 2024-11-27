import { makeAutoObservable } from "mobx";
import { api } from "@docspace/shared/api";

export class TemplateManager {
  templates = new Map();
  templateCategories = new Map();
  templateSettings = new Map();
  recentTemplates = new Map();

  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this, {
      rootStore: false
    });
  }

  // Template Management
  fetchTemplates = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-templates",
        () => api.templates.getTemplates()
      );
      this.setTemplates(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch templates");
      throw err;
    }
  };

  createTemplate = async (templateData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-template",
        () => api.templates.createTemplate(templateData)
      );
      this.addTemplate(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create template");
      throw err;
    }
  };

  updateTemplate = async (templateId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-template",
        () => api.templates.updateTemplate(templateId, updates)
      );
      this.updateTemplateInStore(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update template");
      throw err;
    }
  };

  deleteTemplate = async (templateId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-template",
        () => api.templates.deleteTemplate(templateId)
      );
      this.removeTemplate(templateId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete template");
      throw err;
    }
  };

  // Template Categories
  fetchTemplateCategories = async () => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-template-categories",
        () => api.templates.getTemplateCategories()
      );
      this.setTemplateCategories(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch template categories");
      throw err;
    }
  };

  createTemplateCategory = async (categoryData) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-template-category",
        () => api.templates.createTemplateCategory(categoryData)
      );
      this.addTemplateCategory(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create template category");
      throw err;
    }
  };

  updateTemplateCategory = async (categoryId, updates) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-template-category",
        () => api.templates.updateTemplateCategory(categoryId, updates)
      );
      this.updateTemplateCategoryInStore(response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update template category");
      throw err;
    }
  };

  deleteTemplateCategory = async (categoryId) => {
    try {
      await this.rootStore.loadingManager.withLoading(
        "delete-template-category",
        () => api.templates.deleteTemplateCategory(categoryId)
      );
      this.removeTemplateCategory(categoryId);
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Delete template category");
      throw err;
    }
  };

  // Template Settings
  fetchTemplateSettings = async (templateId) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "fetch-template-settings",
        () => api.templates.getTemplateSettings(templateId)
      );
      this.setTemplateSettings(templateId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Fetch template settings");
      throw err;
    }
  };

  updateTemplateSettings = async (templateId, settings) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "update-template-settings",
        () => api.templates.updateTemplateSettings(templateId, settings)
      );
      this.setTemplateSettings(templateId, response.data);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Update template settings");
      throw err;
    }
  };

  // Template Usage
  createFromTemplate = async (templateId, data) => {
    try {
      const response = await this.rootStore.loadingManager.withLoading(
        "create-from-template",
        () => api.templates.createFromTemplate(templateId, data)
      );
      this.addToRecentTemplates(templateId);
      return response.data;
    } catch (err) {
      this.rootStore.errorHandler.handleError(err, "Create from template");
      throw err;
    }
  };

  // Local state management
  setTemplates = (templates) => {
    this.templates.clear();
    templates.forEach(template => {
      this.templates.set(template.id, {
        ...template,
        created: new Date(template.created),
        modified: new Date(template.modified)
      });
    });
  };

  addTemplate = (template) => {
    this.templates.set(template.id, {
      ...template,
      created: new Date(template.created),
      modified: new Date(template.modified)
    });
  };

  updateTemplateInStore = (template) => {
    this.templates.set(template.id, {
      ...template,
      created: new Date(template.created),
      modified: new Date(template.modified)
    });
  };

  removeTemplate = (templateId) => {
    this.templates.delete(templateId);
    this.templateSettings.delete(templateId);
    this.recentTemplates.delete(templateId);
  };

  setTemplateCategories = (categories) => {
    this.templateCategories.clear();
    categories.forEach(category => {
      this.templateCategories.set(category.id, category);
    });
  };

  addTemplateCategory = (category) => {
    this.templateCategories.set(category.id, category);
  };

  updateTemplateCategoryInStore = (category) => {
    this.templateCategories.set(category.id, category);
  };

  removeTemplateCategory = (categoryId) => {
    this.templateCategories.delete(categoryId);
  };

  setTemplateSettings = (templateId, settings) => {
    this.templateSettings.set(templateId, settings);
  };

  addToRecentTemplates = (templateId) => {
    const template = this.templates.get(templateId);
    if (template) {
      this.recentTemplates.set(templateId, {
        ...template,
        lastUsed: new Date()
      });
    }
  };

  // Computed values
  get templateList() {
    return Array.from(this.templates.values());
  }

  get categoryList() {
    return Array.from(this.templateCategories.values());
  }

  get recentTemplateList() {
    return Array.from(this.recentTemplates.values())
      .sort((a, b) => b.lastUsed - a.lastUsed);
  }

  getTemplate = (templateId) => {
    return this.templates.get(templateId);
  };

  getTemplateCategory = (categoryId) => {
    return this.templateCategories.get(categoryId);
  };

  getTemplateSettings = (templateId) => {
    return this.templateSettings.get(templateId);
  };

  clearAll = () => {
    this.templates.clear();
    this.templateCategories.clear();
    this.templateSettings.clear();
    this.recentTemplates.clear();
  };
}

export default TemplateManager;
