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

export default api;
