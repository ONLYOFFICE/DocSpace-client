const fastify = require("fastify");
const cors = require("@fastify/cors");
const socketioServer = require("fastify-socket.io");
const { serverConfig } = require("./config/config");
const { initializeMetadata } = require("./startup/initMetadata");

// Initialize Fastify with logger
const server = fastify(serverConfig);

// Register plugins
async function registerPlugins() {
  // CORS
  await server.register(cors, {
    origin: true, // Allow all origins in development
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  // Socket.IO
  await server.register(socketioServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Setup Socket.IO events
  server.ready().then(() => {
    server.io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  });
}

// Register routes
async function registerRoutes() {
  // Register route files
  server.register(require("./routes/projects"), { prefix: "/api/projects" });
  server.register(require("./routes/languages"), { prefix: "/api/languages" });
  server.register(require("./routes/namespaces"), {
    prefix: "/api/namespaces",
  });
  server.register(require("./routes/translations"), {
    prefix: "/api/translations",
  });
  server.register(require("./routes/ollama"), { prefix: "/api/ollama" });
  server.register(require("./routes/search"), { prefix: "/api/search" });
  server.register(require("./routes/export-import"), {
    prefix: "/api/export-import",
  });

  // Register key usage routes
  server.register(require("./routes/keyUsageRoutes"));

  // Register test runner routes
  server.register(require("./routes/testRunner"));

  // Register metadata routes
  server.register(require("./routes/metadata"), { prefix: "/api/metadata" });

  // Health check route
  server.get("/health", async (request, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });
}

// Start server
async function startServer() {
  try {
    // Initialize translation metadata
    // console.log("Initializing translation metadata...");
    // await initializeMetadata();
    // console.log("Translation metadata initialization completed");

    // Register plugins and routes
    await registerPlugins();
    await registerRoutes();

    const address = await server.listen({
      port: serverConfig.port,
      host: serverConfig.host,
    });

    console.log(`Server listening on ${address}`);
  } catch (err) {
    console.error("Server startup error:", err);
    server.log.error(err);
    process.exit(1);
  }
}

startServer();
