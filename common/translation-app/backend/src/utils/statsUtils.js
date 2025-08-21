const fs = require('fs-extra');
const path = require('path');
const { appRootPath, projectLocalesMap } = require('../config/config');
const { getAvailableLanguages, getNamespaces, readTranslationFile, resolveProjectPath } = require('./fsUtils');

/**
 * Flatten a nested translation object into key-value pairs with dot notation
 * @param {Object} obj - Translation object
 * @param {string} prefix - Key prefix for nested keys
 * @returns {Object} - Flattened translation object
 */
function flattenTranslations(obj, prefix = '') {
  let result = {};

  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively flatten nested objects
      const flattened = flattenTranslations(obj[key], newKey);
      result = { ...result, ...flattened };
    } else {
      // Add leaf node to result
      result[newKey] = obj[key];
    }
  }

  return result;
}

/**
 * Gets statistics for a project's translations
 * @param {string} projectName - Name of the project
 * @returns {Promise<Object>} - Translation statistics
 */
async function getProjectTranslationStats(projectName) {
  try {
    const languages = await getAvailableLanguages(projectName);
    if (!languages.length) {
      return {
        totalKeys: 0,
        languageStats: []
      };
    }

    // Find the base language (usually 'en')
    const baseLanguage = languages.includes('en') ? 'en' : languages[0];
    
    // Collect all namespaces from all languages
    const allNamespaces = new Set();
    for (const language of languages) {
      const namespaces = await getNamespaces(projectName, language);
      namespaces.forEach(ns => allNamespaces.add(ns));
    }

    // Initialize language stats
    const languageStats = languages.map(language => ({
      language,
      translatedCount: 0,
      untranslatedCount: 0,
      totalCount: 0,
      completionPercentage: 0
    }));

    const baseLanguageIndex = languageStats.findIndex(stat => stat.language === baseLanguage);
    
    // Process each namespace
    for (const namespace of allNamespaces) {
      // Read base language translations as reference
      const baseTranslations = await readTranslationFile(projectName, baseLanguage, namespace);
      if (!baseTranslations) continue;
      
      // Flatten base translations for easier comparison
      const flattenedBase = flattenTranslations(baseTranslations);
      const baseKeys = Object.keys(flattenedBase);
      
      // Update base language stats
      languageStats[baseLanguageIndex].totalCount += baseKeys.length;
      languageStats[baseLanguageIndex].translatedCount += baseKeys.length;
      
      // Process other languages
      for (let i = 0; i < languages.length; i++) {
        if (i === baseLanguageIndex) continue;
        
        const language = languages[i];
        const translations = await readTranslationFile(projectName, language, namespace);
        
        if (!translations) {
          // If translations file doesn't exist, all keys are untranslated
          languageStats[i].untranslatedCount += baseKeys.length;
          languageStats[i].totalCount += baseKeys.length;
          continue;
        }
        
        // Flatten translations for comparison
        const flattenedTranslations = flattenTranslations(translations);
        
        // Compare with base language keys
        for (const key of baseKeys) {
          languageStats[i].totalCount++;
          
          if (flattenedTranslations[key] && flattenedTranslations[key].trim()) {
            languageStats[i].translatedCount++;
          } else {
            languageStats[i].untranslatedCount++;
          }
        }
      }
    }
    
    // Calculate completion percentages
    languageStats.forEach(stat => {
      stat.completionPercentage = stat.totalCount > 0 
        ? (stat.translatedCount / stat.totalCount) * 100 
        : 0;
    });
    
    return {
      totalKeys: languageStats[baseLanguageIndex].totalCount,
      languageStats
    };
  } catch (error) {
    console.error(`Error getting translation stats for project ${projectName}:`, error);
    return {
      totalKeys: 0,
      languageStats: []
    };
  }
}

/**
 * Gets aggregate statistics for all projects' translations
 * @returns {Promise<Object>} - Combined translation statistics
 */
async function getAllProjectsTranslationStats() {
  try {
    const projects = Object.keys(projectLocalesMap);
    const projectStats = await Promise.all(
      projects.map(async project => ({
        projectName: project,
        stats: await getProjectTranslationStats(project)
      }))
    );
    
    // Combine stats from all projects
    const combinedStats = {
      totalKeys: 0,
      languageStats: []
    };
    
    // Track languages we've already processed
    const languageMap = new Map();
    
    for (const { stats } of projectStats) {
      combinedStats.totalKeys += stats.totalKeys;
      
      for (const langStat of stats.languageStats) {
        if (languageMap.has(langStat.language)) {
          // Update existing language stats
          const existingStats = languageMap.get(langStat.language);
          existingStats.translatedCount += langStat.translatedCount;
          existingStats.untranslatedCount += langStat.untranslatedCount;
          existingStats.totalCount += langStat.totalCount;
        } else {
          // Add new language stats
          languageMap.set(langStat.language, {
            language: langStat.language,
            translatedCount: langStat.translatedCount,
            untranslatedCount: langStat.untranslatedCount,
            totalCount: langStat.totalCount,
            completionPercentage: 0
          });
        }
      }
    }
    
    // Convert the map to an array and calculate percentages
    combinedStats.languageStats = Array.from(languageMap.values()).map(stat => ({
      ...stat,
      completionPercentage: stat.totalCount > 0 
        ? (stat.translatedCount / stat.totalCount) * 100 
        : 0
    }));
    
    return combinedStats;
  } catch (error) {
    console.error('Error getting combined translation stats:', error);
    return {
      totalKeys: 0,
      languageStats: []
    };
  }
}

module.exports = {
  getProjectTranslationStats,
  getAllProjectsTranslationStats
};
