// (c) Copyright Ascensio System SIA 2009-2026
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

import { http } from "msw";

import { BASE_URL, API_PREFIX } from "../../e2e/utils";
import type { TAPIPlugin } from "../../../api/plugins/types";

export const PATH_WEB_PLUGINS = "settings/webplugins";

const url = `${BASE_URL}/${API_PREFIX}/${PATH_WEB_PLUGINS}`;

export const mockPlugin1: TAPIPlugin = {
  name: "test-plugin-one",
  version: "1.1.0",
  minDocSpaceVersion: "3.0.0",
  description: "Test Plugin One for e2e testing",
  license: "Apache-2.0",
  author: "ONLYOFFICE",
  homePage: "https://github.com/ONLYOFFICE/docspace-plugins",
  pluginName: "Testpluginone",
  scopes: "ContextMenu,InfoPanel,MainButton",
  image: "icon.png",
  createBy: {
    id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
    displayName: " Administrator",
    avatar: "/static/images/default_user_photo_size_82-82.png?hash=1427579268",
    avatarOriginal:
      "/static/images/default_user_photo_size_200-200.png?hash=1427579268",
    avatarMax:
      "/static/images/default_user_photo_size_200-200.png?hash=1427579268",
    avatarMedium:
      "/static/images/default_user_photo_size_48-48.png?hash=1427579268",
    avatarSmall:
      "/static/images/default_user_photo_size_32-32.png?hash=1427579268",
    profileUrl: "",
    hasAvatar: false,
    isAnonim: false,
  },
  createOn: new Date("2024-01-01T00:00:00Z"),
  enabled: true,
  system: false,
  url: "/plugins/test-plugin-one/plugin.js",
  settings: "",
};

export const mockPlugin2: TAPIPlugin = {
  ...mockPlugin1,
  name: "test-plugin-two",
  version: "1.2.0",
  minDocSpaceVersion: "3.0.0",
  description: "Test Plugin Two for e2e testing",
  pluginName: "Testplugintwo",
};

export const mockPlugin3: TAPIPlugin = {
  ...mockPlugin1,
  name: "test-plugin-three",
  version: "1.3.0",
  minDocSpaceVersion: "10.0.0",
  description: "Test Plugin Three for e2e testing",
  pluginName: "Testpluginthree",
  enabled: false,
};

export const mockLocalePlugin: TAPIPlugin = {
  ...mockPlugin1,
  version: "1.1.0",
  minDocSpaceVersion: "3.5.0",
  name: "archives.zip",
  nameLocale: {
    de: "archive.zip",
    az: "arxivlər.zip",
  },
  description: "Plugin for working with archives",
  descriptionLocale: {
    de: "Plugin für die Verwendung von Archiven",
    az: "Arxivlərlə işləmək üçün plagin",
  },
  pluginName: "Testlocaleplugin",
  url: "/plugins/test-locale-plugin/plugin.js",
};

export const mockContextMenuPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "context-menu-sample",
  version: "1.0.1",
  minDocSpaceVersion: "3.5.0",
  description:
    "Sample plugin demonstrating context menu integration for DocSpace",
  pluginName: "ContextMenuSample",
  scopes: "ContextMenu",
  image: "docspace-icon.svg",
  url: "/plugins/context-menu/plugin.js",
  settings: "",
};

export const mockInfoPanelPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "info-panel",
  version: "1.0.0",
  minDocSpaceVersion: "3.5.0",
  description:
    "Sample plugin demonstrating info panel integration for DocSpace",
  pluginName: "InfoPanelSample",
  scopes: "InfoPanel",
  image: "docspace-icon.svg",
  url: "/plugins/info-panel/plugin.js",
  settings: "",
};

export const mockSelectorPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "selector",
  version: "1.0.0",
  minDocSpaceVersion: "3.5.0",
  description:
    "Sample plugin demonstrating all DocSpace selector types",
  pluginName: "SelectorSample",
  scopes: "ContextMenu",
  image: "docspace-icon.svg",
  url: "/plugins/selector/plugin.js",
  settings: "",
};

export const mockMainButtonPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "main-button",
  version: "1.0.0",
  minDocSpaceVersion: "3.5.0",
  description:
    "Sample plugin demonstrating main button menu integration for DocSpace",
  pluginName: "MainButtonSample",
  scopes: "MainButton",
  image: "docspace-icon.svg",
  url: "/plugins/main-button/plugin.js",
  settings: "",
};

export const mockArticleButtonPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "article-button",
  version: "1.0.0",
  minDocSpaceVersion: "3.5.0",
  description:
    "Sample plugin demonstrating article button sidebar integration for DocSpace",
  pluginName: "ArticleButtonSample",
  scopes: "ArticleButton",
  image: "docspace-icon.svg",
  url: "/plugins/article-button/plugin.js",
  settings: "",
};

export const mockFileItemPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "file-item",
  version: "1.0.0",
  minDocSpaceVersion: "3.5.0",
  description:
    "Sample plugin demonstrating file item click interception for DocSpace",
  pluginName: "FileItemSample",
  scopes: "File",
  image: "docspace-icon.svg",
  url: "/plugins/file-item/plugin.js",
  settings: "",
};

export const mockProfileMenuPlugin: TAPIPlugin = {
  ...mockPlugin1,
  name: "profile-menu",
  version: "1.0.0",
  minDocSpaceVersion: "3.5.0",
  description:
    "Sample plugin demonstrating profile menu integration for DocSpace",
  pluginName: "ProfileMenuSample",
  scopes: "ProfileMenu",
  image: "docspace-icon.svg",
  url: "/plugins/profile-menu/plugin.js",
  settings: "",
};

// Empty plugins list
export const webPluginsEmpty = {
  response: [],
  count: 0,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with data
export const webPluginsWithData = {
  response: [mockPlugin1, mockPlugin3],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with context menu sample plugin
export const webPluginsWithContextMenuPlugin = {
  response: [mockContextMenuPlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with info panel sample plugin
export const webPluginsWithInfoPanelPlugin = {
  response: [mockInfoPanelPlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with selector sample plugin
export const webPluginsWithSelectorPlugin = {
  response: [mockSelectorPlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with main button sample plugin
export const webPluginsWithMainButtonPlugin = {
  response: [mockMainButtonPlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with article button sample plugin
export const webPluginsWithArticleButtonPlugin = {
  response: [mockArticleButtonPlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with file item sample plugin
export const webPluginsWithFileItemPlugin = {
  response: [mockFileItemPlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with profile menu sample plugin
export const webPluginsWithProfileMenuPlugin = {
  response: [mockProfileMenuPlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugins list with locale plugin
export const webPluginsWithLocale = {
  response: [mockLocalePlugin],
  count: 1,
  links: [
    {
      href: url,
      action: "GET",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Plugin upload response (for add operations)
export const webPluginsUploadResponse = {
  count: 1,
  response: mockPlugin2,
  links: [
    {
      href: url,
      action: "POST",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Updated plugin response
export const webPluginsUpdatedResponse = {
  count: 0,
  links: [
    {
      href: url,
      action: "PUT",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Delete success response
export const webPluginsDeleteResponse = {
  count: 0,
  links: [
    {
      href: url,
      action: "DELETE",
    },
  ],
  status: 0,
  statusCode: 200,
};

// Resolvers
export const webPluginsResolver = (
  type:
    | "empty"
    | "withData"
    | "withLocale"
    | "withContextMenuPlugin"
    | "withInfoPanelPlugin"
    | "withSelectorPlugin"
    | "withMainButtonPlugin"
    | "withArticleButtonPlugin"
    | "withFileItemPlugin"
    | "withProfileMenuPlugin" = "empty",
) => {
  let data;

  switch (type) {
    case "withLocale":
      data = webPluginsWithLocale;
      break;
    case "withData":
      data = webPluginsWithData;
      break;
    case "withContextMenuPlugin":
      data = webPluginsWithContextMenuPlugin;
      break;
    case "withInfoPanelPlugin":
      data = webPluginsWithInfoPanelPlugin;
      break;
    case "withSelectorPlugin":
      data = webPluginsWithSelectorPlugin;
      break;
    case "withMainButtonPlugin":
      data = webPluginsWithMainButtonPlugin;
      break;
    case "withArticleButtonPlugin":
      data = webPluginsWithArticleButtonPlugin;
      break;
    case "withFileItemPlugin":
      data = webPluginsWithFileItemPlugin;
      break;
    case "withProfileMenuPlugin":
      data = webPluginsWithProfileMenuPlugin;
      break;
    default:
      data = webPluginsEmpty;
      break;
  }

  return new Response(JSON.stringify(data));
};

export const webPluginsAddResolver = () => {
  return new Response(JSON.stringify(webPluginsUploadResponse));
};

export const webPluginsUpdateResolver = () => {
  return new Response(JSON.stringify(webPluginsUpdatedResponse));
};

export const webPluginsDeleteResolver = () => {
  return new Response(JSON.stringify(webPluginsDeleteResponse));
};

// Handlers
export const webPluginsHandler = (
  port: string,
  type:
    | "empty"
    | "withData"
    | "withLocale"
    | "withContextMenuPlugin"
    | "withInfoPanelPlugin"
    | "withSelectorPlugin"
    | "withMainButtonPlugin"
    | "withArticleButtonPlugin"
    | "withFileItemPlugin"
    | "withProfileMenuPlugin" = "empty",
) => {
  return http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_WEB_PLUGINS}`,
    () => {
      return webPluginsResolver(type);
    },
  );
};

export const webPluginsAddHandler = (port: string) => {
  return http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_WEB_PLUGINS}`,
    () => {
      return webPluginsAddResolver();
    },
  );
};

export const webPluginsUpdateHandler = (port: string) => {
  return http.put(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_WEB_PLUGINS}/:pluginName`,
    () => {
      return webPluginsUpdateResolver();
    },
  );
};

export const webPluginsDeleteHandler = (port: string) => {
  return http.delete(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_WEB_PLUGINS}/:pluginName`,
    () => {
      return webPluginsDeleteResolver();
    },
  );
};

