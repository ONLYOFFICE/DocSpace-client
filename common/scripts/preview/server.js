/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Preview server — process-per-app reverse proxy.
// Each Next.js app runs in its own child process for full isolation
// (separate globalThis, module cache, AsyncLocalStorage).
// The main process acts as an HTTP reverse proxy routing by URL prefix
// and serves Next.js static assets directly.

const { createServer, request: httpRequest } = require("http");
const { fork } = require("child_process");
const path = require("path");
const fs = require("fs");
const net = require("net");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

const port = parseInt(process.env.PORT, 10) || 5055;
const hostname = process.env.HOSTNAME || "0.0.0.0";

const apps = [
  { name: "login", basePath: "/login", internalPort: 5011 },
  { name: "doceditor", basePath: "/doceditor", internalPort: 5013 },
  { name: "management", basePath: "/management", internalPort: 5015 },
  { name: "sdk", basePath: "/sdk", internalPort: 5099 },
];

// Proxy an HTTP request to a child app process.
function proxyRequest(req, res, targetPort) {
  const options = {
    hostname: "127.0.0.1",
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers },
  };

  const proxyReq = httpRequest(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error(`Proxy error → 127.0.0.1:${targetPort}: ${err.message}`);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end("Bad Gateway");
    }
  });

  req.pipe(proxyReq);
}

// Wait for a port to accept TCP connections.
function waitForPort(targetPort, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.on("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for port ${targetPort}`));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.on("timeout", () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Timeout waiting for port ${targetPort}`));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.connect(targetPort, "127.0.0.1");
    };
    check();
  });
}

// Try to serve a static file. Returns true if served, false otherwise.
function serveFile(filePath, res) {
  try {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      res.setHeader("Content-Type", contentType);
      res.statusCode = 200;
      fs.createReadStream(filePath).pipe(res);
      return true;
    }
  } catch {
    // File not found
  }
  return false;
}

// Try to serve a Next.js static file from .next/static/ for the given app.
function tryServeAppStatic(req, res, app) {
  const staticPrefix = app.basePath + "/_next/static/";
  if (!req.url.startsWith(staticPrefix)) return false;

  const relativePath = req.url.slice(staticPrefix.length).split("?")[0];
  const filePath = path.join(
    __dirname,
    "packages",
    app.name,
    ".next",
    "static",
    relativePath,
  );

  if (serveFile(filePath, res)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return true;
  }
  return false;
}

async function main() {
  console.log(`API_HOST=${process.env.API_HOST || "(not set)"}`);

  const workerPath = path.resolve(__dirname, "app-worker.js");
  const children = [];

  // Start all app workers.
  // Children bind to 0.0.0.0 so they are reachable from Docker containers
  // (nginx uses host.docker.internal to reach host ports).
  for (const app of apps) {
    const appDir = path.resolve(__dirname, "packages", app.name);
    console.log(`Starting ${app.name} on port ${app.internalPort}...`);

    const child = fork(workerPath, [appDir], {
      env: {
        ...process.env,
        PORT: String(app.internalPort),
        HOSTNAME: "0.0.0.0",
        NODE_ENV: "production",
      },
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    });

    child.stdout.on("data", (data) => {
      process.stdout.write(`[${app.name}] ${data}`);
    });
    child.stderr.on("data", (data) => {
      process.stderr.write(`[${app.name}] ${data}`);
    });

    child.on("exit", (code, signal) => {
      console.error(
        `[${app.name}] child process exited (code=${code}, signal=${signal})`,
      );
    });

    children.push({ ...app, child });
  }

  // Wait for all apps to accept connections
  console.log("Waiting for all apps to be ready...");
  await Promise.all(
    apps.map(async (app) => {
      await waitForPort(app.internalPort);
      console.log(`${app.name} ready on port ${app.internalPort}.`);
    }),
  );
  console.log("All apps ready.");

  // Create the main reverse proxy server
  createServer((req, res) => {
    // Request logging
    const origEnd = res.end.bind(res);
    res.end = function (...args) {
      if (req.url !== "/health" && !req.url.endsWith("/health")) {
        console.log(
          `[${req.method}] ${req.url} → ${res.statusCode} (host: ${req.headers.host}, fwd: ${req.headers["x-forwarded-host"] || "-"})`,
        );
      }
      return origEnd(...args);
    };

    // Root health check
    if (req.url === "/health") {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = 200;
      return res.end(JSON.stringify({ status: "healthy" }));
    }

    // Per-app health checks
    for (const app of apps) {
      if (req.url === app.basePath + "/health") {
        res.setHeader("Content-Type", "application/json");
        res.statusCode = 200;
        return res.end(JSON.stringify({ status: "healthy" }));
      }
    }

    // Serve static files directly (faster than proxying to child)
    for (const app of apps) {
      if (tryServeAppStatic(req, res, app)) return;
    }

    // Route to the correct app via reverse proxy
    for (const app of apps) {
      if (
        req.url === app.basePath ||
        req.url.startsWith(app.basePath + "/") ||
        req.url.startsWith(app.basePath + "?")
      ) {
        return proxyRequest(req, res, app.internalPort);
      }
    }

    res.statusCode = 404;
    res.end("Not found");
  }).listen(port, hostname, () => {
    console.log(`Preview server listening on http://${hostname}:${port}`);
  });

  // Graceful shutdown: kill all child processes
  const shutdown = () => {
    console.log("Shutting down preview server...");
    for (const { child, name } of children) {
      console.log(`Stopping ${name}...`);
      child.kill("SIGTERM");
    }
    setTimeout(() => process.exit(0), 3000);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Failed to start preview server:", err);
  process.exit(1);
});
