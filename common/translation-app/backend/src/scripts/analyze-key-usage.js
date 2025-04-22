#!/usr/bin/env node

/**
 * Translation Key Usage Analysis Script
 *
 * This script analyzes the codebase to find translation key usage patterns,
 * stores them in a SQLite database, and generates auto-comments for keys.
 *
 * Run with: node analyze-key-usage.js
 *
 * Options:
 *   --update-only: Only update the database, don't show query interface
 *   --key=<key>: Look up usage for a specific key
 *   --module=<module>: Filter keys by module
 */

const { analyzeCodebase } = require("../utils/keyUsageUtils");
const { getKeyRecord } = require("../utils/dbUtils");
const readline = require("readline");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3").verbose();
const { dbConfig } = require("../config/config");
const path = require("path");
const fs = require("fs");

// Create interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  updateOnly: args.includes("--update-only"),
  key: args.find((a) => a.startsWith("--key="))?.split("=")[1],
  module: args.find((a) => a.startsWith("--module="))?.split("=")[1],
};

/**
 * Main function to run the script
 */
async function main() {
  try {
    // If update only, just run analysis and exit
    if (options.updateOnly) {
      console.log("Analyzing codebase for translation key usage...");
      await analyzeCodebase();
      console.log("Analysis complete. Database updated.");
      process.exit(0);
    }

    // If a specific key was provided, look it up
    if (options.key) {
      await lookupKey(options.key);
      process.exit(0);
    }

    // Otherwise, run the interactive CLI
    console.log("Translation Key Usage Analysis Tool");
    console.log("----------------------------------");
    console.log("1. Analyze codebase and update database");
    console.log("2. Look up key usage");
    console.log("3. List most used keys");
    console.log("4. List keys by module");
    console.log("5. Exit");

    rl.question("\nSelect an option: ", async (answer) => {
      switch (answer.trim()) {
        case "1":
          console.log("Analyzing codebase...");
          await analyzeCodebase();
          console.log("Analysis complete.");
          rl.close();
          break;

        case "2":
          rl.question("Enter translation key: ", async (key) => {
            await lookupKey(key);
            rl.close();
          });
          break;

        case "3":
          await listMostUsedKeys();
          rl.close();
          break;

        case "4":
          rl.question(
            "Enter module name (or leave empty for all): ",
            async (module) => {
              await listKeysByModule(module);
              rl.close();
            }
          );
          break;

        case "5":
          console.log("Exiting...");
          rl.close();
          break;

        default:
          console.log("Invalid option");
          rl.close();
      }
    });
  } catch (error) {
    console.error("Error:", error);
    rl.close();
  }
}

/**
 * Looks up usage information for a specific key
 * @param {string} key - Translation key to look up
 */
async function lookupKey(key) {
  const db = await openDatabase();

  try {
    // Get key ID
    const keyRecord = await getKeyRecord(db, key);

    if (!keyRecord) {
      console.log(`Key "${key}" not found in database.`);
      return;
    }

    // Get usage information
    const usages = await db.all(
      `
      SELECT file_path, line_number, context, module
      FROM key_usages
      WHERE key_id = ?
      ORDER BY module, file_path
    `,
      keyRecord.id
    );

    // Get comment
    const comment = await db.get(
      `
      SELECT comment, is_auto, updated_at
      FROM key_comments
      WHERE key_id = ?
    `,
      keyRecord.id
    );

    console.log("\n=== Translation Key Usage Information ===");
    console.log(`Key: ${key}`);

    if (comment) {
      console.log(`Comment: ${comment.comment}`);
      console.log(
        `Comment type: ${comment.is_auto ? "Auto-generated" : "User-defined"}`
      );
      console.log(`Last updated: ${comment.updated_at}`);
    }

    console.log(`\nFound in ${usages.length} location(s):\n`);

    for (const [index, usage] of usages.entries()) {
      console.log(`${index + 1}. Module: ${usage.module}`);
      console.log(`   File: ${usage.file_path}:${usage.line_number}`);
      console.log(`   Context:\n${usage.context}\n`);
    }
  } finally {
    await db.close();
  }
}

/**
 * Lists the most frequently used translation keys
 */
async function listMostUsedKeys() {
  const db = await openDatabase();

  try {
    const keys = await db.all(`
      SELECT tk.key, COUNT(ku.id) as usage_count
      FROM translation_keys tk
      JOIN key_usages ku ON tk.id = ku.key_id
      GROUP BY tk.id
      ORDER BY usage_count DESC
      LIMIT 20
    `);

    console.log("\n=== Most Used Translation Keys ===");

    for (const [index, key] of keys.entries()) {
      console.log(`${index + 1}. "${key.key}" - ${key.usage_count} usage(s)`);
    }
  } finally {
    await db.close();
  }
}

/**
 * Lists translation keys by module
 * @param {string} moduleName - Module name to filter by
 */
async function listKeysByModule(moduleName) {
  const db = await openDatabase();

  try {
    let query = `
      SELECT tk.key, COUNT(ku.id) as usage_count, ku.module
      FROM translation_keys tk
      JOIN key_usages ku ON tk.id = ku.key_id
    `;

    const params = [];

    if (moduleName && moduleName.trim()) {
      query += " WHERE ku.module = ?";
      params.push(moduleName.trim());
    }

    query += `
      GROUP BY tk.id, ku.module
      ORDER BY ku.module, usage_count DESC
    `;

    const keys = await db.all(query, params);

    if (keys.length === 0) {
      console.log(
        `No keys found${moduleName ? ` for module "${moduleName}"` : ""}.`
      );
      return;
    }

    console.log(
      `\n=== Translation Keys${moduleName ? ` for module "${moduleName}"` : ""} ===`
    );

    let currentModule = "";
    let count = 0;

    for (const key of keys) {
      if (currentModule !== key.module) {
        if (currentModule) {
          console.log("");
        }
        currentModule = key.module;
        console.log(`\nModule: ${currentModule}`);
        count = 0;
      }

      count++;
      console.log(`${count}. "${key.key}" - ${key.usage_count} usage(s)`);
    }
  } finally {
    await db.close();
  }
}

/**
 * Opens a connection to the database
 * @returns {Promise<Object>} - Database connection
 */
async function openDatabase() {
  try {
    // Make sure we're working with absolute paths
    const dbDir = path.resolve(dbConfig.dbPath);
    const dbFilePath = dbConfig.dbPath;

    console.log(`Database directory: ${dbDir}`);
    console.log(`Database file path: ${dbFilePath}`);

    // Ensure the database directory exists
    if (!fs.existsSync(dbDir)) {
      console.log(`Creating database directory: ${dbDir}`);
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Return database connection
    return await open({
      filename: dbFilePath,
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.error("Error opening database:", error);
    throw error;
  }
}

// Run the script
main().catch((err) => {
  console.error("Error running script:", err);
  process.exit(1);
});
