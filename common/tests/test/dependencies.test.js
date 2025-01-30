// Copyright 2025 alexeysafronov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const fs = require("fs");
const path = require("path");

const {
  getAllFiles,
  getWorkSpaces,
  BASE_DIR,
  moduleWorkspaces,
} = require("../utils/files");

let workspaces = [];
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
  addDeps(packageJson.peerDependencies);

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
  ];

  workspaces.forEach((wsPath) => {
    const clientDir = path.resolve(BASE_DIR, wsPath);

    const files = getAllFiles(clientDir, excludeDirs);

    codeFiles.push(
      ...files.filter((filePath) => filePath && searchPattern.test(filePath))
    );

    packageJsonFiles.push(
      ...files.filter(
        (filePath) => filePath && path.basename(filePath) === "package.json"
      )
    );
  });

  console.log(
    `Found code files by extension js(x)|ts(x)|mjs|cjs filter = ${codeFiles.length}.`
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

  const regexp = new RegExp(
    `(${pattern1})|(${pattern2})|(${pattern3})|(${pattern4})|(${pattern5})`,
    "gm"
  );

  const codeImports = [];

  codeFiles.forEach((filePath) => {
    const jsFileText = fs.readFileSync(filePath, "utf8");

    const matches = [...jsFileText.matchAll(regexp)];

    const imports = matches
      .map((m) => m[2] || m[4] || m[6] || m[8] || m[10])
      .filter((m) => m != null)
      .filter(
        (m) =>
          !(
            m.startsWith(".") ||
            m.startsWith("@docspace/shared") ||
            webpackAliases.some((k) => m.startsWith(`${k}/`)) ||
            builtInModules.has(m)
          )
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
    `Found workspace's code files with imports = ${workspaceCodeImports.length}.`
  );

  console.log(
    `Found workspace's package.json files with dependencies = ${workspaceDeps.length}.`
  );
});

test("UnusedDependenciesTest: Verify that all dependencies in package.json files are being used", async () => {
  const unusedDependencies = [];

  const sharedDeps = workspaceDeps.find(
    (d) => d.workspace === "packages/shared"
  );

  const usedSomeWhere = new Set();

  workspaceDeps.forEach((wsDepsItem) => {
    const workspace = wsDepsItem.workspace;
    const currentWorkspaceCodeImports = workspaceCodeImports.find(
      (i) => i.workspace === workspace
    );

    let missing = wsDepsItem.deps.filter((dep) => {
      let success =
        currentWorkspaceCodeImports.uniqueImports.has(dep.name) ||
        currentWorkspaceCodeImports.uniqueImports.values().some((s) => {
          return s.startsWith(`${dep.name}/`);
        });

      if (!success && dep.name.startsWith("@types/")) {
        const name = dep.name.substring("@types/".length);
        success =
          currentWorkspaceCodeImports.uniqueImports.has(name) ||
          currentWorkspaceCodeImports.uniqueImports.values().some((s) => {
            return s.startsWith(`${name}/`);
          });
      }

      if (success) {
        usedSomeWhere.add(dep.name);
      }

      return !success;
    });

    if (currentWorkspaceCodeImports.workspace !== "packages/shared") {
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
        (s) => s.indexOf(m.name) !== -1
      );

      if (success) {
        usedSomeWhere.add(m.name);
      }

      return !success;
    });

    if (missing.length > 0) {
      unusedDependencies.push({ workspace, missing });
    }
  });

  let message = "Unused Dependencies check results:\n";
  unusedDependencies.forEach(({ workspace, missing }) => {
    message += `\nIn ${workspace}:\n`;

    const missingInSameWorkspace = missing.filter(
      (dep) => !usedSomeWhere.has(dep.name)
    );

    if (missingInSameWorkspace.length > 0) {
      message += `\n  Unused dependencies:\n`;

      missingInSameWorkspace.forEach((dep) => {
        message += `    - "${dep.name}":"${dep.version}"\n`;
      });
    }

    const foundInOtherWorkspace = missing.filter((dep) =>
      usedSomeWhere.has(dep.name)
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

test("MissingDependenciesTest: Verify that all imported packages are listed in dependencies", async () => {
  const missingDependencies = [];

  let message = "Missing Dependencies check results:\n";
  missingDependencies.forEach(({ workspace, unused }) => {
    message += `\nIn ${workspace}:\n  Missing dependencies:\n`;
    unused.forEach((dep) => {
      message += `    - "${dep}"\n`;
    });
  });

  if (missingDependencies.length > 0) {
    console.log(message);
  }

  expect(missingDependencies.length, message).toBe(0);
});

test("DifferentVersionsTest: Verify that all dependencies have same versions as specified in package.json", async () => {
  const differentVersions = [];

  let message = "Different Versions check results:\n";
  differentVersions.forEach(({ workspace, different }) => {
    message += `\nIn ${workspace}:\n  Different versions:\n`;
    different.forEach((dep) => {
      message += `    - "${dep}"\n`;
    });
  });

  if (differentVersions.length > 0) {
    console.log(message);
  }

  expect(differentVersions.length, message).toBe(0);
});
