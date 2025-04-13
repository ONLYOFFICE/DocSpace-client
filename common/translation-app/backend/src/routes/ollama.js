const { ollamaConfig } = require('../config/config');
const fsUtils = require('../utils/fsUtils');

/**
 * Ollama integration route handler
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  // Get available models from Ollama
  fastify.get('/models', async (request, reply) => {
    try {
      const response = await fetch(`${ollamaConfig.apiUrl}/api/tags`);
      
      if (!response.ok) {
        return reply.code(response.status).send({ 
          success: false, 
          error: 'Failed to fetch models from Ollama API' 
        });
      }
      
      const data = await response.json();
      return { success: true, data: data.models || [] };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Failed to connect to Ollama API',
        details: error.message
      });
    }
  });

  // Translate a single key
  fastify.post('/translate/key', async (request, reply) => {
    try {
      const { 
        projectName, 
        sourceLanguage, 
        targetLanguage, 
        namespace, 
        key, 
        model 
      } = request.body;
      
      if (!model) {
        return reply.code(400).send({ success: false, error: 'Model is required' });
      }
      
      // Get source text from the source language file
      const sourceTranslations = await fsUtils.readTranslationFile(projectName, sourceLanguage, namespace);
      
      if (!sourceTranslations) {
        return reply.code(404).send({ success: false, error: 'Source translation file not found' });
      }
      
      // Extract source text from the key path
      const keyParts = key.split('.');
      let sourceText = sourceTranslations;
      for (const part of keyParts) {
        if (!sourceText[part]) {
          return reply.code(404).send({ success: false, error: `Key "${key}" not found in source` });
        }
        sourceText = sourceText[part];
      }
      
      if (typeof sourceText !== 'string') {
        return reply.code(400).send({ success: false, error: 'Source text is not a string' });
      }
      
      // Send notification that translation is starting
      fastify.io.emit('translation:started', { projectName, targetLanguage, namespace, key });
      
      // Translate with Ollama
      const translatedText = await translateText(
        sourceText, 
        sourceLanguage, 
        targetLanguage, 
        model
      );
      
      // Update the translation file
      const targetTranslations = await fsUtils.readTranslationFile(projectName, targetLanguage, namespace) || {};
      
      // Update the key in the target translations
      let current = targetTranslations;
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      const finalKey = keyParts[keyParts.length - 1];
      current[finalKey] = translatedText;
      
      // Save the updated translation file
      const success = await fsUtils.writeTranslationFile(
        projectName, 
        targetLanguage, 
        namespace, 
        targetTranslations
      );
      
      if (!success) {
        return reply.code(500).send({ success: false, error: 'Failed to update translation file' });
      }
      
      // Send notification that translation is completed
      fastify.io.emit('translation:completed', { 
        projectName, 
        targetLanguage, 
        namespace, 
        key, 
        value: translatedText 
      });
      
      return { 
        success: true, 
        data: { 
          sourceText, 
          translatedText 
        } 
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ 
        success: false, 
        error: 'Translation failed', 
        details: error.message 
      });
    }
  });
  
  // Batch translate all keys in a namespace
  fastify.post('/translate/namespace', async (request, reply) => {
    try {
      const { 
        projectName, 
        sourceLanguage, 
        targetLanguage, 
        namespace, 
        model 
      } = request.body;
      
      if (!model) {
        return reply.code(400).send({ success: false, error: 'Model is required' });
      }
      
      // Get source translations
      const sourceTranslations = await fsUtils.readTranslationFile(projectName, sourceLanguage, namespace);
      
      if (!sourceTranslations) {
        return reply.code(404).send({ success: false, error: 'Source translation file not found' });
      }
      
      // Get or create target translations
      let targetTranslations = await fsUtils.readTranslationFile(projectName, targetLanguage, namespace) || {};
      
      // Start translation process asynchronously
      reply.send({ 
        success: true, 
        message: 'Batch translation started',
        data: { 
          totalKeys: countStringValues(sourceTranslations) 
        }
      });
      
      // Notify clients that batch translation started
      fastify.io.emit('batch-translation:started', { 
        projectName, 
        targetLanguage, 
        namespace,
        totalKeys: countStringValues(sourceTranslations)
      });
      
      // Use a helper function to translate nested keys
      await translateNestedKeys(
        fastify,
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        sourceTranslations,
        targetTranslations,
        model,
        '', // Start with empty key prefix
        0 // Start counter at 0
      );
      
      // Save the final translations
      await fsUtils.writeTranslationFile(
        projectName, 
        targetLanguage, 
        namespace, 
        targetTranslations
      );
      
      // Notify clients that batch translation is completed
      fastify.io.emit('batch-translation:completed', { 
        projectName, 
        targetLanguage, 
        namespace 
      });
      
    } catch (error) {
      request.log.error(error);
      fastify.io.emit('batch-translation:error', { 
        error: 'Batch translation failed', 
        details: error.message 
      });
    }
  });
}

/**
 * Recursive function to translate all nested keys
 */
async function translateNestedKeys(
  fastify,
  projectName,
  sourceLanguage,
  targetLanguage,
  namespace,
  sourceObj,
  targetObj,
  model,
  prefix,
  counter
) {
  for (const [key, value] of Object.entries(sourceObj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string' && value.trim()) {
      // Update counter and notify clients of progress
      counter++;
      fastify.io.emit('batch-translation:progress', { 
        projectName, 
        targetLanguage, 
        namespace,
        currentKey: fullKey,
        counter
      });
      
      try {
        // Translate the text
        const translatedText = await translateText(
          value, 
          sourceLanguage, 
          targetLanguage, 
          model
        );
        
        // Set the translated text in the target object
        let current = targetObj;
        const keyParts = fullKey.split('.');
        
        for (let i = 0; i < keyParts.length - 1; i++) {
          const part = keyParts[i];
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
        
        const finalKey = keyParts[keyParts.length - 1];
        current[finalKey] = translatedText;
        
      } catch (error) {
        fastify.log.error(`Failed to translate key ${fullKey}: ${error.message}`);
        // Continue with other keys even if one fails
      }
    } else if (typeof value === 'object' && value !== null) {
      // Ensure target has this key as an object
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        targetObj[key] = {};
      }
      
      // Recursively translate nested object
      counter = await translateNestedKeys(
        fastify,
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        value,
        targetObj[key],
        model,
        fullKey,
        counter
      );
    }
  }
  
  return counter;
}

/**
 * Count string values in a nested object
 */
function countStringValues(obj) {
  let count = 0;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      count++;
    } else if (typeof value === 'object' && value !== null) {
      count += countStringValues(value);
    }
  }
  
  return count;
}

/**
 * Translate text using Ollama API
 */
async function translateText(text, sourceLanguage, targetLanguage, model) {
  try {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return only the translated text without any commentary or explanations:\n\n${text}`;
    
    const response = await fetch(`${ollamaConfig.apiUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.3 // Lower temperature for more accurate translations
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.response.trim();
    
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

module.exports = routes;
