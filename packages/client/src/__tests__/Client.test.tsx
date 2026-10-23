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

import { render, screen } from "@testing-library/react";
import { Provider } from "mobx-react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";

import { FolderType } from "@docspace/shared/enums";

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/private/filter", search: "", state: null }),
  useNavigate: () => vi.fn(),
  Outlet: () => null,
}));

vi.mock("react-i18next", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  withTranslation:
    () =>
    (Component: React.ComponentType<Record<string, unknown>>) =>
    (props: Record<string, unknown>) => (
      <Component {...props} t={(key: string) => key} />
    ),
}));

vi.mock("@docspace/shared/utils/common", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  updateTempContent: vi.fn(),
}));

vi.mock("SRC_DIR/components/FilesPanels", () => ({ default: () => null }));
vi.mock("SRC_DIR/components/GlobalEvents", () => ({ default: () => null }));
vi.mock("SRC_DIR/components/Article", () => ({
  ArticleBodyContent: () => null,
  ArticleHeaderContent: () => null,
  ArticleMainButtonContent: () => null,
}));
vi.mock("SRC_DIR/components/ArticleWrapper", () => ({ default: () => null }));
vi.mock("SRC_DIR/components/AccountsSidebar", () => ({ default: () => null }));
vi.mock("SRC_DIR/components/DeveloperToolsSidebar", () => ({
  default: () => null,
}));
vi.mock("SRC_DIR/components/BillingSidebar", () => ({ default: () => null }));
vi.mock("SRC_DIR/components/SdkFrameHost/SdkFrameContext", () => ({
  SdkFrameProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("SRC_DIR/components/SdkFrameHost/SdkFrameHost", () => ({
  default: () => null,
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store", () => ({
  useAiChatStoreOptional: () => null,
}));
vi.mock("SRC_DIR/components/NewFilesBadge", () => ({ default: () => null }));
vi.mock("SRC_DIR/components/AppsSidebar", () => ({
  default: ({
    groups,
  }: {
    groups: { items: { id: string; children?: { id: string }[] }[] }[];
  }) => (
    <ul>
      {groups
        .flatMap((group) => group.items)
        .flatMap((item) => [item, ...(item.children ?? [])])
        .map((item) => (
          <li key={item.id} data-testid={`nav-${item.id}`} />
        ))}
    </ul>
  ),
}));

// Every prop comes from the stores of the Provider below.
const { Client } = (await import("../Client")) as unknown as {
  Client: React.ComponentType;
};

const renderInFrame = (showMenu: boolean) =>
  render(
    <Provider
      authStore={{
        isAdmin: true,
        isRoomAdmin: false,
        isAuthenticated: true,
        isLoaded: true,
      }}
      userStore={{ user: { id: "user-1", isVisitor: false } }}
      treeFoldersStore={{
        treeFolders: [
          { id: 1, title: "My documents", rootFolderType: FolderType.USER },
          { id: 2002, title: "Rooms", rootFolderType: FolderType.Rooms },
          { id: 2003, title: "Archive", rootFolderType: FolderType.Archive },
        ],
        roomsFolderId: 2002,
        archiveFolderId: 2003,
        myFolderId: 1,
        isTemplatesFolderRoot: false,
        isDocumentsFolder: false,
      }}
      filesStore={{ setSelection: vi.fn(), initFiles: vi.fn(async () => {}) }}
      clientLoadingStore={{
        isLoaded: true,
        isLoading: false,
        showArticleLoader: false,
        setIsLoaded: vi.fn(),
        setIsSectionBodyLoading: vi.fn(),
        setIsSectionFilterLoading: vi.fn(),
        setIsSectionHeaderLoading: vi.fn(),
      }}
      pluginStore={{ isInit: true, initPlugins: vi.fn() }}
      infoPanelStore={{ isVisible: false }}
      settingsStore={{
        aiServicesEnabled: true,
        isFrame: true,
        frameConfig: { showMenu },
        isDesktopClient: false,
        enablePlugins: false,
      }}
      appsStore={{
        isInstalled: () => true,
        isPrivateRoomsSectionAvailable: true,
        ensureLoaded: vi.fn(),
      }}
    >
      <Client />
    </Provider>,
  );

describe("Client — the article in an embedded frame", () => {
  it("Frame showing the menu", () => {
    renderInFrame(true);

    expect(screen.getByTestId("nav-private-rooms")).toBeInTheDocument();
  });

  it("Frame hiding the menu", () => {
    renderInFrame(false);

    expect(screen.queryByTestId("nav-private-rooms")).not.toBeInTheDocument();
  });
});
