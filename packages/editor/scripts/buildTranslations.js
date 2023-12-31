const path = require("path");
const beforeBuild = require("@docspace/common/utils/beforeBuild");

beforeBuild(
  [
    path.join(__dirname, "../public/locales"),
    path.join(__dirname, "../../../public/locales"),
  ],
  path.join(__dirname, "../src/autoGeneratedTranslations.js"),
  {
    path: path.join(__dirname, "../../client/public/locales"),
    files: [
      "ChangeOwnerPanel.json",
      "EmbeddingPanel.json",
      "Files.json",
      "PeopleSelector.json",
      "PeopleTranslations.json",
      "SharingPanel.json",
      "Translations.json",
    ],
    alias: "CLIENT_PUBLIC_DIR",
  }
);
