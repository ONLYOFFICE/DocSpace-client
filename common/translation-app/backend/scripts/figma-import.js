/**
 * Script to import text and component references from Figma into file-based metadata
 * 
 * This script:
 * 1. Connects to the Figma API using the FIGMA_API_KEY from .env
 * 2. Fetches a Figma file structure
 * 3. Extracts text elements and their component references
 * 4. Stores the data in file-based metadata for use in the translation system
 * 
 * Usage: node scripts/figma-import.js <figma-file-key> [project-name] [namespace]
 * Example: node scripts/figma-import.js 12345abcdef Common figma
 */

require('dotenv').config();
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const appRootPath = require('app-root-path').toString();
const { projectLocalesMap } = require('../src/config/config');

// Constants
const FIGMA_API_KEY = process.env.FIGMA_API_KEY;
const BASE_LANGUAGE = process.env.BASE_LANGUAGE || 'en';

// Check if Figma API key is available
if (!FIGMA_API_KEY) {
  console.error('Error: FIGMA_API_KEY is not set in the .env file');
  process.exit(1);
}

// Ensure metadata directories exist
console.log('Initializing metadata directories...');
function ensureMetadataDirectories() {
  try {
    for (const project in projectLocalesMap) {
      const localesPath = projectLocalesMap[project];
      if (!localesPath) continue;
      
      const projectPath = path.join(appRootPath, localesPath);
      const metaDir = path.join(projectPath, '.meta');
      
      fs.ensureDirSync(metaDir);
      console.log(`Metadata directory ensured for project: ${project}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize metadata directories:', error);
    return false;
  }
}

if (!ensureMetadataDirectories()) {
  console.error('Failed to initialize metadata directories');
  process.exit(1);
}
console.log('Metadata directories initialized successfully');

// Get Figma file key from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Please provide a Figma file key');
  console.log('Usage: node scripts/figma-import.js <figma-file-key>');
  process.exit(1);
}

const figmaFileKey = args[0];

// Configuration options
const options = {
  projectName: args[1] || 'Common', // Default to Common project
  namespace: args[2] || 'figma',    // Default namespace for Figma texts
  batchSize: 100,                    // Number of items to process in one batch
  generateKeys: true,                // Auto-generate translation keys
  extractAllText: false              // Extract all text or just ones with names
};

console.log(`Starting Figma import for file: ${figmaFileKey}`);
console.log(`Options: ${JSON.stringify(options, null, 2)}`);

/**
 * Fetch Figma file data
 * @param {string} fileKey - Figma file key
 * @returns {Promise<object>} Figma file data
 */
async function fetchFigmaFile(fileKey) {
  console.log(`Fetching Figma file: ${fileKey}...`);
  
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: {
      'X-Figma-Token': FIGMA_API_KEY
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Figma file: ${response.status} ${response.statusText}\n${errorText}`);
  }
  
  const data = await response.json();
  console.log('Figma file fetched successfully');
  return data;
}

/**
 * Sleep function to pause execution
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get node thumbnail URL with retry logic
 * @param {string} fileKey - Figma file key
 * @param {string} nodeId - Figma node ID
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @returns {Promise<string>} Thumbnail URL
 */
async function getNodeThumbnail(fileKey, nodeId, retries = 3, initialDelay = 1000) {
  let currentRetry = 0;
  let delay = initialDelay;
  
  while (currentRetry <= retries) {
    try {
      const response = await fetch(`https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`, {
        headers: {
          'X-Figma-Token': FIGMA_API_KEY
        }
      });
      
      if (response.status === 429) {
        // Rate limit exceeded, exponential backoff
        currentRetry++;
        const retryAfter = response.headers.get('Retry-After') || delay / 1000;
        const waitTime = retryAfter * 1000 || delay;
        console.log(`Rate limit exceeded for node ${nodeId}. Retrying after ${waitTime}ms (retry ${currentRetry}/${retries})`);
        await sleep(waitTime);
        delay *= 2; // Exponential backoff
        continue;
      }
      
      if (!response.ok) {
        console.error(`Failed to fetch thumbnail for node ${nodeId}: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      return data.images[nodeId];
    } catch (error) {
      console.error(`Error fetching thumbnail for node ${nodeId}:`, error);
      currentRetry++;
      if (currentRetry <= retries) {
        console.log(`Retrying... (${currentRetry}/${retries})`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
      } else {
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Extract text elements from Figma document
 * @param {object} node - Figma node
 * @param {Array} textElements - Accumulated text elements
 * @param {object} parentInfo - Parent component information
 * @param {string} path - Path in the document structure
 * @returns {Array} Array of text elements
 */
function extractTextElements(node, textElements = [], parentInfo = {}, path = '') {
  if (!node) return textElements;
  
  // Update path with current node name if available
  const currentPath = node.name ? 
    path ? `${path} / ${node.name}` : node.name : 
    path;
  
  // Track component information
  let currentParentInfo = { ...parentInfo };
  
  // If this is a component, update parent info
  if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    currentParentInfo = {
      componentId: node.id,
      componentName: node.name,
      componentType: node.type,
      screen: path
    };
  }
  
  // If this is a frame that looks like a screen, update screen info
  if (node.type === 'FRAME' && (node.name.toLowerCase().includes('screen') || 
      node.name.toLowerCase().includes('page') || 
      node.name.toLowerCase().includes('view'))) {
    currentParentInfo.screen = node.name;
  }
  
  // Process text nodes
  if (node.type === 'TEXT' && node.characters) {
    // Only extract text that's not empty and meets our criteria
    if (node.characters.trim() && 
        (options.extractAllText || node.name.trim() !== '')) {
      
      const textElement = {
        id: node.id,
        name: node.name,
        characters: node.characters,
        path: currentPath,
        componentId: currentParentInfo.componentId,
        componentName: currentParentInfo.componentName,
        componentType: currentParentInfo.componentType,
        screen: currentParentInfo.screen
      };
      
      textElements.push(textElement);
    }
  }
  
  // Recursively process children
  if (node.children) {
    node.children.forEach(child => {
      extractTextElements(child, textElements, currentParentInfo, currentPath);
    });
  }
  
  return textElements;
}

/**
 * Generate a translation key from text content
 * @param {string} text - Text content
 * @param {string} path - Path in the document
 * @returns {string} Generated key
 */
function generateTranslationKey(text, path) {
  // Get last part of the path (most specific component)
  const pathSegments = path.split('/').map(s => s.trim());
  const lastSegment = pathSegments[pathSegments.length - 1];
  
  // Clean up the text to use as part of the key
  let keyFromText = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '_')        // Replace spaces with underscores
    .substring(0, 20);           // Limit length
  
  // Clean up last segment to use as namespace
  let namespace = lastSegment
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 20);
  
  // Combine them
  return `${namespace}.${keyFromText}`;
}

/**
 * Find or create metadata file for a key
 * @param {string} projectName - Project name
 * @param {string} namespace - Namespace
 * @param {string} keyPath - Key path
 * @returns {Promise<{filePath: string, data: object}>} File path and existing data
 */
async function findOrCreateMetadataFile(projectName, namespace, keyPath) {
  const localesPath = projectLocalesMap[projectName];
  if (!localesPath) {
    throw new Error(`Project ${projectName} not found in configuration`);
  }
  
  const projectPath = path.join(appRootPath, localesPath);
  const namespacePath = path.join(projectPath, '.meta', namespace);
  
  // Ensure namespace directory exists
  await fs.ensureDir(namespacePath);
  
  // Determine file path for key
  const metadataFilePath = path.join(namespacePath, `${keyPath}.json`);
  
  // Check if the file exists and create it if not
  let data = {};
  try {
    if (await fs.pathExists(metadataFilePath)) {
      data = await fs.readJson(metadataFilePath);
    } else {
      // Initialize new metadata file
      data = {
        key_path: keyPath,
        namespace: namespace,
        project: projectName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'new',
        usage: [],
        figma_references: [],
        history: []
      };
    }
    
    return { filePath: metadataFilePath, data };
  } catch (error) {
    console.error(`Error finding/creating metadata file for ${keyPath}:`, error);
    throw error;
  }
}

/**
 * Store text elements in file-based metadata
 * @param {Array} textElements - Text elements to store
 * @param {string} figmaFileKey - Figma file key
 * @returns {Promise<void>}
 */
async function storeTextElements(textElements, figmaFileKey) {
  console.log(`Storing ${textElements.length} text elements in file-based metadata...`);
  
  // Process each text element
  let processedCount = 0;
  
  for (const element of textElements) {
    try {
      // Generate a key for the translation
      const keyPath = options.generateKeys ? 
        generateTranslationKey(element.characters, element.path) : 
        `figma_${element.id}`;
      
      // Find or create metadata file
      const { filePath, data } = await findOrCreateMetadataFile(
        options.projectName,
        options.namespace,
        keyPath
      );
      
      // Update metadata with context from Figma
      data.context = `Figma path: ${element.path}`;
      data.notes = `Imported from Figma file ${figmaFileKey}`;
      data.status = 'review_needed';
      data.updated_at = new Date().toISOString();
      
      // Add or update Figma reference
      const figmaReference = {
        figma_file_key: figmaFileKey,
        figma_node_id: element.id,
        component_name: element.componentName || element.name,
        screen_name: element.screen,
        updated_at: new Date().toISOString()
      };
      
      // Check if reference already exists and update it
      const existingRefIndex = (data.figma_references || []).findIndex(
        ref => ref.figma_node_id === element.id
      );
      
      if (existingRefIndex >= 0) {
        data.figma_references[existingRefIndex] = {
          ...data.figma_references[existingRefIndex],
          ...figmaReference
        };
      } else {
        // Initialize if needed
        if (!data.figma_references) {
          data.figma_references = [];
        }
        data.figma_references.push(figmaReference);
      }
      
      // Record import in history
      if (!data.history) {
        data.history = [];
      }
      
      data.history.push({
        action: 'figma_import',
        old_value: null,
        new_value: element.characters,
        user_id: 'figma-import-script',
        user_name: 'Figma Import Script',
        timestamp: new Date().toISOString()
      });
      
      // Write updated metadata back to file
      await fs.writeJson(filePath, data, { spaces: 2 });
      
      // Log progress for every 10 items
      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${textElements.length} elements`);
      }
    } catch (error) {
      console.error(`Error processing element ${element.id}:`, error);
      // Continue with other elements despite the error
    }
  }
  
  console.log('All text elements stored successfully');
}

/**
 * Find metadata files that reference a specific Figma node ID
 * @param {string} figmaFileKey - Figma file key
 * @param {string} nodeId - Figma node ID
 * @returns {Promise<Array<{filePath: string, data: object}>>} Matching metadata files
 */
async function findMetadataFilesWithFigmaNodeId(figmaFileKey, nodeId) {
  const matches = [];
  
  // Search through all projects
  for (const project in projectLocalesMap) {
    const localesPath = projectLocalesMap[project];
    if (!localesPath) continue;
    
    const projectPath = path.join(appRootPath, localesPath);
    const metaDir = path.join(projectPath, '.meta');
    
    if (!await fs.pathExists(metaDir)) continue;
    
    // Get all namespace directories
    const namespaceDirs = await fs.readdir(metaDir);
    
    for (const namespace of namespaceDirs) {
      const namespacePath = path.join(metaDir, namespace);
      if (!(await fs.stat(namespacePath)).isDirectory()) continue;
      
      // Get all metadata files in this namespace
      const metadataFiles = glob.sync(path.join(namespacePath, '*.json'));
      
      for (const filePath of metadataFiles) {
        try {
          const data = await fs.readJson(filePath);
          
          // Check if this file references the Figma node
          if (data.figma_references && 
              data.figma_references.some(ref => 
                ref.figma_file_key === figmaFileKey && 
                ref.figma_node_id === nodeId)) {
            matches.push({ filePath, data });
          }
        } catch (error) {
          console.error(`Error reading metadata file ${filePath}:`, error);
        }
      }
    }
  }
  
  return matches;
}

/**
 * Main function to orchestrate the import process
 */
async function main() {
  try {
    // Fetch Figma file
    const figmaData = await fetchFigmaFile(figmaFileKey);
    
    // Extract text elements from the document
    console.log('Extracting text elements from the Figma document...');
    const textElements = extractTextElements(figmaData.document);
    console.log(`Found ${textElements.length} text elements`);
    
    // Store text elements in file-based metadata
    await storeTextElements(textElements, figmaFileKey);
    
    // Process thumbnails in batches
    console.log('Processing thumbnails...');
    const batchSize = 10; // Reduced from 20 to avoid hitting rate limits
    const delayBetweenRequests = 500; // Add delay between requests (ms)
    const delayBetweenBatches = 2000; // Add delay between batches (ms)
    
    for (let i = 0; i < textElements.length; i += batchSize) {
      const batch = textElements.slice(i, i + batchSize);
      console.log(`Processing thumbnail batch ${i/batchSize + 1}/${Math.ceil(textElements.length/batchSize)}`);
      
      // Process each thumbnail sequentially with rate limiting
      for (const element of batch) {
        // Find the metadata files that reference this Figma node
        const metadataFiles = await findMetadataFilesWithFigmaNodeId(figmaFileKey, element.id);
        
        if (metadataFiles.length > 0) {
          const thumbnailUrl = await getNodeThumbnail(figmaFileKey, element.id);
          
          if (thumbnailUrl) {
            // Update thumbnail URL in all relevant metadata files
            for (const { filePath, data } of metadataFiles) {
              // Find the figma reference in the data
              const refIndex = data.figma_references.findIndex(
                ref => ref.figma_node_id === element.id
              );
              
              if (refIndex >= 0) {
                data.figma_references[refIndex].thumbnail_url = thumbnailUrl;
                data.updated_at = new Date().toISOString();
                await fs.writeJson(filePath, data, { spaces: 2 });
              }
            }
          }
          
          // Add delay between requests to avoid rate limiting
          await sleep(delayBetweenRequests);
        }
      }
      
      // Add delay between batches
      if (i + batchSize < textElements.length) {
        console.log(`Pausing between batches to avoid rate limits (${delayBetweenBatches}ms)`);
        await sleep(delayBetweenBatches);
      }
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

// Execute the main function
main();
