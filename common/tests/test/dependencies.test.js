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

import { it, expect, beforeAll } from "vitest";
const fs = require("fs");
const path = require("path");

const {
  getAllFiles,
  getWorkSpaces,
  BASE_DIR,
  moduleWorkspaces,
} = require("../utils/files");

let workspaces = [];

// Peer dependency names declared by the installed copies of a workspace's
// direct dependencies, read straight from node_modules/<dep>/package.json:
// pnpm links every declared dependency there, and require.resolve is no use
// because a package with an `exports` map (ai-chat among them) does not
// expose its package.json.
const peerNamesOf = (wsDepsItem) => {
  const names = new Set();
  const nodeModules = path.join(path.dirname(wsDepsItem.path), "node_modules");

  for (const dep of wsDepsItem.deps) {
    try {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(nodeModules, dep.name, "package.json"), "utf8"),
      );
      for (const peer of Object.keys(manifest.peerDependencies ?? {})) {
        names.add(peer);
      }
    } catch {
      // Not installed, or no manifest: nothing to learn from it.
    }
  }

  return names;
};
let workspaceCodeImports = [];
let workspaceDeps = [];

// Helper function to get all dependencies from a package.json file
const getPackageDependencies = (packageJson) => {
  const deps = [];

  // Helper to add dependencies with version info
  const addDeps = (dependencies) => {
    if (dependencies) {
      Object.entries(dependencies).forEach(([name, version]) => {
        if (version !== "workspace:*") {
          deps.push({ name, version });
        }
      });
    }
  };

  // Get dependencies from all sections
  addDeps(packageJson.dependencies);
  addDeps(packageJson.devDependencies);
  // addDeps(packageJson.peerDependencies);

  return deps;
};

beforeAll(() => {
  console.log(`Base path = ${BASE_DIR}`);

  workspaces = getWorkSpaces();

  const searchPattern = /\.(js|jsx|ts|tsx|mjs|cjs)$/;

  let codeFiles = [];
  let packageJsonFiles = [];

  const excludeDirs = [
    ".nx",
    ".yarn",
    ".github",
    ".vscode",
    ".git",
    "dist",
    ".next",
    "campaigns",
    "storybook-static",
    "node_modules",
    ".meta",
  ];

  workspaces.forEach((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    const files = getAllFiles(clientDir, excludeDirs);

    codeFiles.push(
      ...files.filter((filePath) => filePath && searchPattern.test(filePath)),
    );

    packageJsonFiles.push(
      ...files.filter(
        (filePath) => filePath && path.basename(filePath) === "package.json",
      ),
    );
  });

  console.log(
    `Found code files by extension js(x)|ts(x)|mjs|cjs filter = ${codeFiles.length}.`,
  );

  // Node.js built-in modules to ignore
  const builtInModules = new Set([
    "fs",
    "path",
    "http",
    "https",
    "url",
    "os",
    "crypto",
    "util",
    "events",
    "stream",
    "buffer",
    "querystring",
    "string_decoder",
    "timers",
    "assert",
    "console",
    "async",
    "dotenv",
  ]);

  // Webpack aliases and internal modules to ignore
  const webpackAliases = [
    "ASSETS_DIR",
    "PUBLIC_DIR",
    "SRC_DIR",
    "PACKAGE_FILE",
    "CLIENT_PUBLIC_DIR",
    "src",
    "client",
    "enums",
    "themes",
    "skeletons",
    "__tests__",
    "${alias}",
    "@",
    "@/..",
    "@/components",
    "@/hooks",
    "@/providers",
    "@/styles",
    "@/types",
    "@/utils",
    "@/constants",
    "@/store",
    "@/api",
    "@/models",
    "@/layouts",
    "@/pages",
    "@/config",
    "@/assets",
    "@/locales",
    "@/services",
    "@/middleware",
    "@/helpers",
    "@/lib",
  ];

  const depNamePattern = "[a-zA-Z0-9@/_.:-]+";

  const pattern1 = `require\\(['"](${depNamePattern})['"]\\)`;
  const pattern2 = `import\\(['"](${depNamePattern})['"]\\)`;
  const pattern3 = `from\\s+['"](${depNamePattern})['"]`;
  const pattern4 = `loader:\\s+['"](${depNamePattern})['"]`;
  const pattern5 = `target:\\s+['"](${depNamePattern})['"],`;
  const pattern6 = `import\\s+['"](${depNamePattern})['"];`;

  const regexp = new RegExp(
    `(${pattern1})|(${pattern2})|(${pattern3})|(${pattern4})|(${pattern5})|(${pattern6})`,
    "gm",
  );

  const codeImports = [];

  codeFiles.forEach((filePath) => {
    const jsFileText = fs.readFileSync(filePath, "utf8");

    const matches = [...jsFileText.matchAll(regexp)];

    const imports = matches
      .map((m) => m[2] || m[4] || m[6] || m[8] || m[10] || m[12])
      .filter((m) => m != null)
      .filter(
        (m) =>
          !(
            m.startsWith(".") ||
            m.startsWith("@docspace/shared") ||
            webpackAliases.some((k) => m.startsWith(`${k}/`)) ||
            builtInModules.has(m)
          ),
      );

    if (imports.length === 0) return;

    const codeImport = {
      name: path.basename(filePath),
      workspace: moduleWorkspaces.find((ws) => filePath.includes(ws)),
      path: filePath,
      imports,
    };

    codeImports.push(codeImport);
  });

  moduleWorkspaces.forEach((ws) => {
    const workspaceImports = codeImports.filter((ci) => ci.workspace === ws);

    const mapped = workspaceImports.flatMap((ci) => ci.imports);

    workspaceCodeImports.push({
      workspace: ws,
      files: workspaceImports,
      uniqueImports: new Set(mapped),
    });
  });

  packageJsonFiles.forEach((filePath) => {
    const packageJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const deps = getPackageDependencies(packageJson);

    const scripts = packageJson.scripts;

    console.log(`Found deps = ${deps.length}.`);

    workspaceDeps.push({
      workspace: moduleWorkspaces.find((ws) => filePath.includes(ws)),
      path: filePath,
      deps,
      scripts,
    });
  });

  console.log(
    `Found workspace's code files with imports = ${workspaceCodeImports.length}.`,
  );

  console.log(
    `Found workspace's package.json files with dependencies = ${workspaceDeps.length}.`,
  );
});

it("UnusedDependenciesTest: Verify that all dependencies in package.json files are being used", async () => {
  const unusedDependencies = [];

  const sharedDeps = workspaceDeps.find(
    (d) => d.workspace === path.join("packages", "shared"),
  );

  const usedSomeWhere = new Set();

  workspaceDeps.forEach((wsDepsItem) => {
    const workspace = wsDepsItem.workspace;
    const currentWorkspaceCodeImports = workspaceCodeImports.find(
      (i) => i.workspace === workspace,
    );

    let missing = wsDepsItem.deps.filter((dep) => {
      let success =
        currentWorkspaceCodeImports.uniqueImports.has(dep.name) ||
        Array.from(currentWorkspaceCodeImports.uniqueImports.values()).some(
          (s) => {
            return s.startsWith(`${dep.name}/`);
          },
        );

      if (!success && dep.name.startsWith("@types/")) {
        const name = dep.name.substring("@types/".length);
        success =
          currentWorkspaceCodeImports.uniqueImports.has(name) ||
          Array.from(currentWorkspaceCodeImports.uniqueImports.values()).some(
            (s) => {
              return s.startsWith(`${name}/`);
            },
          );
      }

      if (success) {
        usedSomeWhere.add(dep.name);
      }

      return !success;
    });

    if (
      currentWorkspaceCodeImports.workspace !== path.join("packages", "shared")
    ) {
      missing = missing.filter((m) => {
        const success = sharedDeps.deps.find((d) => d.name === m.name);

        if (success) {
          usedSomeWhere.add(m.name);
        }

        return !success;
      });
    }

    missing = missing.filter((m) => {
      const success = Object.values(wsDepsItem.scripts).some(
        (s) => s.indexOf(m.name) !== -1,
      );

      if (success) {
        usedSomeWhere.add(m.name);
      }

      return !success;
    });

    // A dependency nothing imports can still be load-bearing. pnpm does not
    // install optional peers, so an app that renders a library's optional
    // module has to declare that module's peers itself: client and sdk carry
    // ai-chat's LLM SDKs, radix and codemirror this way, and ui-kit's
    // markdown stack. Such an entry is used by the package that lists it as
    // a peer, and the installed manifest says which ones do.
    const peersOfDeclared = peerNamesOf(wsDepsItem);

    missing = missing.filter((m) => {
      const success = peersOfDeclared.has(m.name);

      if (success) {
        usedSomeWhere.add(m.name);
      }

      return !success;
    });

    // Filter out allowed unused dependencies
    const allowedUnusedDeps = [
      // packages/shared tooling that is configured rather than imported: the
      // Babel preset chain (babel.config), Storybook (.storybook), the Vitest
      // module mock and its types, ts-node for the config loaders, Biome and
      // open-cli behind package scripts of the root, and two runtime shims
      // (linkifyjs, path-browserify) that host bundles resolve by name.
      "@babel/plugin-proposal-export-default-from",
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-export-namespace-from",
      "@babel/plugin-transform-private-property-in-object",
      "@babel/plugin-transform-runtime",
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript",
      "@babel/runtime",
      "@biomejs/biome",
      "@storybook/addon-docs",
      "@storybook/react",
      "@types/element-resize-detector",
      "@types/identity-obj-proxy",
      "identity-obj-proxy",
      "linkifyjs",
      "open-cli",
      "path-browserify",
      "ts-node",
    ];

    missing = missing.filter((m) => !allowedUnusedDeps.includes(m.name));

    if (missing.length > 0) {
      unusedDependencies.push({ workspace, missing });
    }
  });

  let message = "Unused Dependencies check results:\n";
  unusedDependencies.forEach(({ workspace, missing }) => {
    message += `\nIn ${workspace}:\n`;

    const missingInSameWorkspace = missing.filter(
      (dep) => !usedSomeWhere.has(dep.name),
    );

    if (missingInSameWorkspace.length > 0) {
      message += `\n  Unused dependencies:\n`;

      missingInSameWorkspace.forEach((dep) => {
        message += `    - "${dep.name}":"${dep.version}"\n`;
      });
    }

    const foundInOtherWorkspace = missing.filter((dep) =>
      usedSomeWhere.has(dep.name),
    );

    if (foundInOtherWorkspace.length > 0) {
      message += `\n  Found in other workspace:\n`;
      foundInOtherWorkspace.forEach((dep) => {
        message += `    - "${dep.name}":"${dep.version}"\n`;
      });
    }
  });

  if (unusedDependencies.length > 0) {
    console.log(message);
  }

  expect(unusedDependencies.length, message).toBe(0);
});

it("DifferentDependencyVersionsTest: Verify that all workspaces use same dependency versions", () => {
  // List of packages to be ignored
  const ignoredPackages = new Set([]);

  const dependencyMap = {};

  // Create a Map of dependencies and their versions in all workspaces
  for (const { workspace, deps } of workspaceDeps) {
    deps.forEach(({ name, version }) => {
      if (ignoredPackages.has(name)) return;

      if (!dependencyMap[name]) {
        dependencyMap[name] = {};
      }

      dependencyMap[name][workspace] = version;
    });
  }

  const mismatchedDeps = [];

  // Check if each dependency has same version in all workspaces
  for (const [depName, versionsByWorkspace] of Object.entries(dependencyMap)) {
    const uniqueVersions = new Set(Object.values(versionsByWorkspace));

    if (uniqueVersions.size > 1) {
      const versionList = Object.entries(versionsByWorkspace)
        .map(([ws, ver]) => `  - ${ws}: ${ver}`)
        .join("\n");

      mismatchedDeps.push(
        `❌ ${depName} has different versions:\n${versionList}`,
      );
    }
  }

  if (mismatchedDeps.length > 0) {
    const report = mismatchedDeps.join("\n\n");
    throw new Error(
      `Found ${mismatchedDeps.length} dependencies with version mismatch:\n\n ${report}`,
    );
  }
});
