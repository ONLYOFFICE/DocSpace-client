/**
 * Script to import text and component references from Figma into the SQLite database
 * 
 * This script:
 * 1. Connects to the Figma API using the FIGMA_API_KEY from .env
 * 2. Fetches a Figma file structure
 * 3. Extracts text elements and their component references
 * 4. Stores the data in the SQLite database for use in the translation system
 * 
 * Usage: node scripts/figma-import.js <figma-file-key>
 * Example: node scripts/figma-import.js 12345abcdef
 */

require('dotenv').config();
const fetch = require('node-fetch');
const path = require('path');
const { getDatabase } = require('../src/db/connection');
const { figmaReferences, translationsMetadata, history } = require('../src/db/repository');
const dbMigrations = require('../src/db/migrations');

// Constants
const FIGMA_API_KEY = process.env.FIGMA_API_KEY;
const BASE_LANGUAGE = process.env.BASE_LANGUAGE || 'en';

// Check if Figma API key is available
if (!FIGMA_API_KEY) {
  console.error('Error: FIGMA_API_KEY is not set in the .env file');
  process.exit(1);
}

// Initialize database
console.log('Initializing database...');
const dbInitialized = dbMigrations.initializeDatabase();
if (!dbInitialized) {
  console.error('Failed to initialize database');
  process.exit(1);
}
console.log('Database initialized successfully');

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
 * Store text elements in the database
 * @param {Array} textElements - Text elements to store
 * @param {string} figmaFileKey - Figma file key
 * @returns {Promise<void>}
 */
async function storeTextElements(textElements, figmaFileKey) {
  console.log(`Storing ${textElements.length} text elements in the database...`);
  
  // Get database connection
  const db = getDatabase();
  
  // Process in transaction for better performance
  try {
    await db.transaction(() => {
      // Store each text element
      for (const element of textElements) {
        // Generate a key for the translation
        const keyPath = options.generateKeys ? 
          generateTranslationKey(element.characters, element.path) : 
          `figma_${element.id}`;
        
        // Store in metadata
        const metadata = translationsMetadata.findOrCreate(
          options.projectName, 
          BASE_LANGUAGE, 
          options.namespace,
          keyPath
        );
        
        // Update metadata with context from Figma
        translationsMetadata.update(metadata.id, {
          context: `Figma path: ${element.path}`,
          notes: `Imported from Figma file ${figmaFileKey}`,
          status: 'review_needed',
          updated_at: new Date().toISOString()
        });
        
        // Store Figma reference
        figmaReferences.addReference(
          options.projectName,
          BASE_LANGUAGE,
          options.namespace,
          keyPath,
          {
            figmaFileKey: figmaFileKey,
            figmaNodeId: element.id,
            componentName: element.componentName || element.name,
            screenName: element.screen
          }
        );
        
        // Record import in history
        history.recordChange(
          options.projectName,
          BASE_LANGUAGE,
          options.namespace,
          keyPath,
          'figma_import',
          null,
          element.characters,
          'figma-import-script',
          'Figma Import Script'
        );
        
        // Log progress for every 10 items
        if (textElements.indexOf(element) % 10 === 0) {
          console.log(`Processed ${textElements.indexOf(element)}/${textElements.length} elements`);
        }
      }
    })();
    
    console.log('All text elements stored successfully');
  } catch (error) {
    console.error('Error storing text elements:', error);
    throw error;
  }
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
    
    // Store text elements in the database
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
        // Find the reference in the database
        const refs = figmaReferences.findBy({
          figma_file_key: figmaFileKey,
          figma_node_id: element.id
        });
        
        if (refs.length > 0) {
          const thumbnailUrl = await getNodeThumbnail(figmaFileKey, element.id);
          
          if (thumbnailUrl) {
            // Update thumbnail URL in the database
            figmaReferences.updateThumbnail(refs[0].id, thumbnailUrl);
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
