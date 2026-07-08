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

/**
 * Simple server script to serve the static files from the dist directory
 * using the serve package.
 * 
 * Run with: node server.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 5001;
const DIST_DIR = path.join(__dirname, 'dist');

console.log(`Starting server on port ${PORT}...`);
console.log(`Serving static files from: ${DIST_DIR}`);

// Spawn the serve process
const serveProcess = spawn('npx', ['serve', 'dist', '-s', '-p', PORT.toString()], {
  stdio: 'inherit',
  shell: true
});

// Handle process events
serveProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serveProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  serveProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  serveProcess.kill();
  process.exit(0);
});
