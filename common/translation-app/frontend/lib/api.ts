import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Projects
export const getProjects = () => api.get('/projects');
export const getProject = (projectName: string) => api.get(`/projects/${projectName}`);

// Languages
export const getLanguages = (projectName: string) => api.get(`/languages/${projectName}`);
export const addLanguage = (projectName: string, language: string) => 
  api.post(`/languages/${projectName}`, { language });

// Namespaces
export const getNamespaces = (projectName: string, language: string) => 
  api.get(`/namespaces/${projectName}/${language}`);
export const addNamespace = (projectName: string, namespace: string, content = {}) => 
  api.post(`/namespaces/${projectName}`, { namespace, content });
export const renameNamespace = (projectName: string, oldName: string, newName: string) => 
  api.put(`/namespaces/${projectName}/rename`, { oldName, newName });
export const moveNamespaceTo = (sourceProjectName: string, sourceNamespace: string, targetProjectName: string, targetNamespace: string) => 
  api.put(`/namespaces/${sourceProjectName}/move`, { sourceNamespace, targetProjectName, targetNamespace });
export const deleteNamespace = (projectName: string, namespace: string) => 
  api.delete(`/namespaces/${projectName}/${namespace}`);

// Translations
export const getTranslations = (projectName: string, language: string, namespace: string) => 
  api.get(`/translations/${projectName}/${language}/${namespace}`);
export const updateTranslations = (projectName: string, language: string, namespace: string, translations: object) => 
  api.put(`/translations/${projectName}/${language}/${namespace}`, translations);
export const updateTranslationKey = (
  projectName: string, 
  language: string, 
  namespace: string, 
  key: string, 
  value: string,
  isAiTranslated = false
) => api.put(`/translations/${projectName}/${language}/${namespace}/key`, { key, value, isAiTranslated });

// Key operations
export const renameTranslationKey = (
  projectName: string,
  namespace: string,
  oldKeyPath: string,
  newKeyPath: string
) => api.put(`/translations/${projectName}/rename-key`, { namespace, oldKeyPath, newKeyPath });

export const moveTranslationKey = (
  sourceProjectName: string,
  sourceNamespace: string,
  targetProjectName: string,
  targetNamespace: string,
  keyPath: string
) => api.put(`/translations/${sourceProjectName}/move-key`, { 
  sourceNamespace, 
  targetProjectName, 
  targetNamespace, 
  keyPath 
});

export const deleteTranslationKey = (
  projectName: string,
  namespace: string,
  keyPath: string
) => api.delete(`/translations/${projectName}/${namespace}/key/${encodeURIComponent(keyPath)}`);

// Ollama
export const getOllamaModels = () => api.get('/ollama/models');
export const translateKey = (
  projectName: string,
  sourceLanguage: string,
  targetLanguage: string,
  namespace: string,
  key: string,
  model: string
) => api.post('/ollama/translate/key', { projectName, sourceLanguage, targetLanguage, namespace, key, model });
export const translateNamespace = (
  projectName: string,
  sourceLanguage: string,
  targetLanguage: string,
  namespace: string,
  model: string
) => api.post('/ollama/translate/namespace', { projectName, sourceLanguage, targetLanguage, namespace, model });

// Validation with Ollama LLM
export const validateTranslation = (
  projectName: string,
  sourceLanguage: string,
  targetLanguage: string,
  namespace: string,
  key: string,
  sourceText: string,
  targetText: string,
  model: string
) => api.post('/ollama/validate/translation', { 
  projectName, 
  sourceLanguage, 
  targetLanguage, 
  namespace, 
  key, 
  sourceText, 
  targetText, 
  model 
});

export const validateNamespaceTranslations = (
  projectName: string,
  sourceLanguage: string,
  targetLanguage: string,
  namespace: string,
  model: string,
  maxKeys?: number
) => api.post('/ollama/validate/namespace', { 
  projectName, 
  sourceLanguage, 
  targetLanguage, 
  namespace, 
  model,
  maxKeys
});

// Translation Statistics
export const fetchTranslationStats = async (projectName?: string) => {
  const response = await api.get(projectName 
    ? `/translations/stats/${projectName}` 
    : '/translations/stats');
  return response.data.data;
};

export default api;
