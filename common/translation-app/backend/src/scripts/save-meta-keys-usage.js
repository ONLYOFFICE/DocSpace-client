// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

const fs = require("fs");
const path = require("path");
const { writeJsonWithConsistentEolSync } = require("../utils/fsUtils");

const BASE_DIR =
  process.env.BASE_DIR || path.resolve(__dirname, "../../../../../");

const moduleWorkspaces = [
  "packages/client",
  "packages/doceditor",
  "packages/login",
  "packages/shared",
  "packages/management",
];

const getWorkSpaces = () => {
  const workspaces = moduleWorkspaces.map((ws) => path.resolve(BASE_DIR, ws));

  return workspaces;
};

const getAllFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.flatMap((file) => {
    const filePath = path.join(dir, file);
    const isDirectory = fs.statSync(filePath).isDirectory();
    if (isDirectory) {
      if (
        filePath.includes("e2e") ||
        filePath.includes(".yarn") ||
        filePath.includes(".github") ||
        filePath.includes(".vscode") ||
        filePath.includes(".git") ||
        filePath.includes("__mocks__") ||
        filePath.includes("dist") ||
        filePath.includes("test") ||
        filePath.includes("tests") ||
        filePath.includes(".next") ||
        filePath.includes("campaigns") ||
        filePath.includes("storybook-static") ||
        filePath.includes("node_modules") ||
        filePath.includes(".meta") ||
        filePath.includes(".nx")
      ) {
        return null;
      }

      return getAllFiles(filePath);
    } else {
      return filePath;
    }
  });
};

const convertPathToOS = (filePath) => {
  return path.sep == "/"
    ? filePath.replace("\\", "/")
    : filePath.replace("/", "\\");
};

let workspaces = [];
let translationFiles = [];
let javascriptFiles = [];
let parseJsonErrors = [];

console.log(`Base path = ${BASE_DIR}`);

workspaces = getWorkSpaces();
const commonLocalesPath = path.resolve(BASE_DIR, "public/locales");
workspaces.push(commonLocalesPath);

const translations = workspaces.flatMap((wsPath) => {
  const clientDir = path.resolve(BASE_DIR, wsPath);

  return getAllFiles(clientDir).filter(
    (filePath) =>
      filePath &&
      filePath.endsWith(".json") &&
      filePath.includes(convertPathToOS("public/locales")) &&
      filePath.includes(convertPathToOS("/en/"))
  );
});

console.log(`Found translations by *.json filter = ${translations.length}.`);

for (const tPath of translations) {
  try {
    const fileContent = fs.readFileSync(tPath, "utf8");

    //const hash = crypto.createHash("md5").update(fileContent).digest("hex");

    const jsonTranslation = JSON.parse(fileContent);

    const translationFile = {
      path: tPath,
      fileName: path.basename(tPath),
      translations: Object.entries(jsonTranslation).map(([key, value]) => ({
        key,
        value,
      })),
      //md5hash: hash,
      language: path.dirname(tPath).split(path.sep).pop(),
    };

    translationFiles.push(translationFile);
  } catch (ex) {
    parseJsonErrors.push({ path: tPath, error: ex });
    console.log(
      `File path = ${tPath} failed to parse with error: ${ex.message}`
    );
  }
}

console.log(`Found translationFiles = ${translationFiles.length}.`);

const searchPattern = /\.(js|jsx|ts|tsx)$/;
const javascripts = workspaces.flatMap((wsPath) => {
  const clientDir = path.resolve(BASE_DIR, wsPath);

  return {
    workspace: wsPath,
    files: getAllFiles(clientDir).filter(
      (filePath) =>
        filePath &&
        searchPattern.test(filePath) &&
        !filePath.includes(".test.") &&
        !filePath.includes(".stories.")
    ),
  };
});

console.log(`Found javascripts by js(x)|ts(x) filter = ${javascripts.length}.`);

const pattern1 =
  "[.{\\s\\(]t\\??\\.?\\(\\s*[\"'`]([a-zA-Z0-9_.:\\s{}/-]+)[\"'`]\\s*[\\),]";
const pattern2 = 'i18nKey="([a-zA-Z0-9_.:-]+)"';
const pattern3 = 'tKey:\\s"([a-zA-Z0-9_.:-]+)"';
const pattern4 = 'getTitle\\("([a-zA-Z0-9_.:-]+)"\\)';

const regexp = new RegExp(
  `(${pattern1})|(${pattern2})|(${pattern3})|(${pattern4})`,
  "gm"
);

const usagesData = {};

const findNamespace = (key, translations) => {
  const tFile = translations.find((t) =>
    t.translations.find((tv) => tv.key === key)
  );
  if (tFile) {
    return tFile.fileName.split(".")[0];
  }
  return null;
};

javascripts.forEach(({ workspace, files }) => {
  const workspaceTranslations = translationFiles.filter((t) =>
    t.path.includes(workspace)
  );

  files.forEach((filePath) => {
    const jsFileText = fs.readFileSync(filePath, "utf8");

    const matches = [...jsFileText.matchAll(regexp)];

    const translationKeys = matches
      .map((m) => m[2] || m[4] || m[6] || m[8])
      .filter((m) => m != null);

    if (translationKeys.length === 0) return;

    translationKeys.forEach((key) => {
      // Find all occurrences of the key in the file content
      let lineNumber = 0;
      let codeFragment = "";

      // Find the line number where the key is used
      const lines = jsFileText.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(key)) {
          lineNumber = i + 1; // Convert to 1-based line numbering

          // Extract code fragment with context (5 lines before and after)
          const startLine = Math.max(0, i - 5);
          const endLine = Math.min(lines.length - 1, i + 5);
          codeFragment = lines
            .map((l) => l.trim())
            .slice(startLine, endLine + 1)
            .join("\n ")
            .trim();

          // If we found a match, no need to continue searching
          break;
        }
      }

      // Detect the correct meta path for the key
      // Assuming the key might be in format "namespace:key" or just "key"
      let namespace = "Common"; // Default namespace
      let clearKey = key;
      let metaPath;
      if (key.includes(":")) {
        const parts = key.split(":");
        namespace = parts[0];
        clearKey = parts[1];
      } else {
        namespace = findNamespace(key, workspaceTranslations) || "Common";
      }

      metaPath =
        namespace === "Common"
          ? path.join(commonLocalesPath, ".meta", namespace, `${clearKey}.json`)
          : path.join(
              workspace,
              "public",
              "locales",
              ".meta",
              namespace,
              `${clearKey}.json`
            );

      if (!fs.existsSync(metaPath)) {
        metaPath = path.join(
          workspace,
          "public",
          "locales",
          ".meta",
          namespace,
          `${clearKey}.json`
        );

        if (!fs.existsSync(metaPath)) {
          namespace = null;
          metaPath = null;
          const tFile = translationFiles.find((t) =>
            t.translations.find((tv) => tv.key === clearKey)
          );
          if (tFile) {
            namespace = tFile.fileName.split(".")[0];
            const paths = tFile.path.split(path.sep).slice(0, -2);
            const projectPath = paths.join(path.sep);
            metaPath = path.join(
              projectPath,
              ".meta",
              namespace,
              `${clearKey}.json`
            );
          }

          if (
            (namespace === null && metaPath === null) ||
            !fs.existsSync(metaPath)
          ) {
            console.log(
              `Metadata file ${metaPath} does not exist. Skipping...`
            );
            return;
          }
        }
      }

      // Create usage object with all the required information
      const usage = {
        file_path: filePath.replace(BASE_DIR, "").replace(/\\/g, "/"),
        line_number: lineNumber,
        context: codeFragment,
        module: workspace.replace(BASE_DIR, "").replace(/\\/g, "/"),
      };

      if (!usagesData[metaPath]) {
        usagesData[metaPath] = [];
      }

      usagesData[metaPath].push(usage);
    });
  });
});

console.log(`Found usages = ${Object.keys(usagesData).length}.`);

console.log(`Found parseJsonErrors = ${parseJsonErrors.length}.`);

console.log(`Found translationFiles = ${translationFiles.length}.`);

console.log(`Found javascripts = ${javascripts.length}.`);

Object.entries(usagesData).forEach(([metaPath, usages]) => {
  try {
    console.log(`Processing metadata file ${metaPath}`);
    if (!fs.existsSync(metaPath)) {
      console.log(`Metadata file ${metaPath} does not exist. Skipping...`);
      return;
    }

    const metaData = fs.readFileSync(metaPath, "utf8");

    const meta = JSON.parse(metaData);

    //todo: compare usages with meta.usage skip update if no changes
    if (JSON.stringify(meta.usage) === JSON.stringify(usages)) {
      return;
    }

    meta.usage = usages;
    meta.updated_at = new Date().toISOString();

    writeJsonWithConsistentEolSync(metaPath, meta, { spaces: 2 });

    console.log(`Processed metadata file ${metaPath}`);
  } catch (error) {
    console.error(`Error processing metadata file ${metaPath}:`, error);
  }
});
