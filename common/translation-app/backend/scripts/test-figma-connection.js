/**
 * Script to test the Figma API connection
 * 
 * This script validates that:
 * 1. The Figma API key is valid
 * 2. We can access a specific Figma file
 * 3. We can fetch file information
 * 
 * Usage: node scripts/test-figma-connection.js <figma-file-key>
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Constants
const FIGMA_API_KEY = process.env.FIGMA_API_KEY;

// Check if Figma API key is available
if (!FIGMA_API_KEY) {
  console.error('Error: FIGMA_API_KEY is not set in the .env file');
  process.exit(1);
}

// Get Figma file key from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Please provide a Figma file key');
  console.log('Usage: node scripts/test-figma-connection.js <figma-file-key>');
  process.exit(1);
}

const figmaFileKey = args[0];

/**
 * Test Figma API connection
 */
async function testConnection() {
  try {
    console.log('Testing Figma API connection...');
    console.log(`Using API key: ${FIGMA_API_KEY.substring(0, 5)}...${FIGMA_API_KEY.substring(FIGMA_API_KEY.length - 4)}`);
    console.log(`Testing with file key: ${figmaFileKey}`);
    
    // Test file access
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${figmaFileKey}?depth=1`, {
      headers: {
        'X-Figma-Token': FIGMA_API_KEY
      }
    });
    
    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      throw new Error(`Failed to access Figma file: ${fileResponse.status} ${fileResponse.statusText}\n${errorText}`);
    }
    
    const fileData = await fileResponse.json();
    console.log('\n✅ Successfully connected to Figma API!');
    console.log('\nFile information:');
    console.log(`- Name: ${fileData.name}`);
    console.log(`- Last modified: ${new Date(fileData.lastModified).toLocaleString()}`);
    console.log(`- Version: ${fileData.version}`);
    console.log(`- Document: ${fileData.document.name}`);
    
    // Count pages
    const pages = fileData.document.children || [];
    console.log(`- Pages: ${pages.length}`);
    
    // List pages
    if (pages.length > 0) {
      console.log('\nPages in this file:');
      pages.forEach(page => {
        console.log(`- ${page.name} (${page.id})`);
      });
    }
    
    // Test thumbnail access
    console.log('\nTesting thumbnail access...');
    const thumbnailResponse = await fetch(`https://api.figma.com/v1/images/${figmaFileKey}?ids=${pages[0]?.id || fileData.document.id}&format=png&scale=1`, {
      headers: {
        'X-Figma-Token': FIGMA_API_KEY
      }
    });
    
    if (!thumbnailResponse.ok) {
      const errorText = await thumbnailResponse.text();
      throw new Error(`Failed to access thumbnails: ${thumbnailResponse.status} ${thumbnailResponse.statusText}\n${errorText}`);
    }
    
    const thumbnailData = await thumbnailResponse.json();
    
    if (thumbnailData.images && Object.keys(thumbnailData.images).length > 0) {
      console.log('✅ Successfully accessed thumbnails!');
      console.log('Sample thumbnail URL:');
      const nodeId = Object.keys(thumbnailData.images)[0];
      console.log(`- Node ID ${nodeId}: ${thumbnailData.images[nodeId]}`);
    } else {
      console.log('⚠️ No thumbnails were generated. This might be expected for some files.');
    }
    
    console.log('\n✅ All tests passed! You can now use the figma-import.js script.');
    
  } catch (error) {
    console.error('\n❌ Error testing Figma connection:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
testConnection();
