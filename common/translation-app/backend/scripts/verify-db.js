/**
 * Utility script to verify database setup and migrations
 */
const { getDatabase } = require("../src/db/connection");
const { dbConfig } = require("../src/config/config");
const dbMigrations = require("../src/db/migrations");
const repositories = require("../src/db/repository");

console.log("Verifying database setup...");
console.log("Database path:", dbConfig.dbPath);

// Initialize database
console.log("Running migrations...");
const initialized = dbMigrations.initializeDatabase();

if (!initialized) {
  console.error("❌ Failed to initialize database");
  process.exit(1);
}

console.log("✅ Database migrations completed successfully");

// Get database connection
const db = getDatabase();

// Verify tables
console.log("\nVerifying database tables:");
const tables = db
  .prepare(
    `
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
`
  )
  .all();

if (tables.length === 0) {
  console.error("❌ No tables found in database");
  process.exit(1);
}

console.log("Found tables:");
tables.forEach((table) => {
  console.log(`- ${table.name}`);
});

// Test table schema
console.log("\nVerifying table schemas:");
tables.forEach((table) => {
  const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
  console.log(`Table ${table.name} has ${columns.length} columns:`);
  columns.forEach((col) => {
    console.log(`  - ${col.name} (${col.type})`);
  });
});

// Test repository functions
console.log("\nTesting repository functions:");

// Test inserting metadata
console.log("\nInserting test metadata...");
try {
  const testMetadata = repositories.translationsMetadata.findOrCreate(
    "TestProject",
    "en",
    "common",
    "test.key"
  );

  console.log("✅ Test metadata created:", testMetadata);

  // Add a Figma reference
  const figmaRef = repositories.figmaReferences.addReference(
    "TestProject",
    "en",
    "common",
    "test.key",
    {
      figmaFileKey: "test123",
      figmaNodeId: "node123",
      componentName: "TestComponent",
      screenName: "TestScreen",
    }
  );

  console.log("✅ Test Figma reference created:", figmaRef);

  // Add a comment
  const comment = repositories.comments.addComment(
    "TestProject",
    "en",
    "common",
    "test.key",
    {
      text: "This is a test comment",
      userId: "test-user",
      userName: "Test User",
    }
  );

  console.log("✅ Test comment created:", comment);

  // Record a history entry
  const historyEntry = repositories.history.recordChange(
    "TestProject",
    "en",
    "common",
    "test.key",
    "create",
    null,
    "Initial value",
    "test-user",
    "Test User"
  );

  console.log("✅ Test history entry created:", historyEntry);

  console.log("\n✅ All repository tests completed successfully");
} catch (error) {
  console.error("❌ Repository test failed:", error);
  process.exit(1);
}

console.log("\n✅ Database verification completed successfully");
