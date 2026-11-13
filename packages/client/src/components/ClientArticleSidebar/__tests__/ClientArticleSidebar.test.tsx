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

import { render, screen, within } from "@testing-library/react";
import { Provider } from "mobx-react";
import { describe, expect, it, vi } from "vitest";

import { FolderType } from "@docspace/shared/enums";

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/private/filter", search: "" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store", () => ({
  useAiChatStoreOptional: () => null,
}));

vi.mock("SRC_DIR/components/NewFilesBadge", () => ({
  default: ({
    newFilesCount,
    folderId,
  }: {
    newFilesCount: number;
    folderId: string | number;
  }) => (
    <span data-testid="new-files-badge" data-folder={folderId}>
      {newFilesCount}
    </span>
  ),
}));

vi.mock("SRC_DIR/components/BetaBadgeWrapper", () => ({
  default: ({
    title,
    description,
  }: {
    title?: string;
    description?: string;
  }) => (
    <span data-testid="beta-badge" data-title={title}>
      {description}
    </span>
  ),
}));

type TNavEntry = {
  id: string;
  badgeComponent?: React.ReactNode;
  children?: TNavEntry[];
};

vi.mock("SRC_DIR/components/AppsSidebar", () => ({
  default: ({ groups }: { groups: { items: TNavEntry[] }[] }) => (
    <ul>
      {groups
        .flatMap((group) => group.items)
        .flatMap((item) => [item, ...(item.children ?? [])])
        .map((item) => (
          <li key={item.id} data-testid={`nav-${item.id}`}>
            {item.badgeComponent}
          </li>
        ))}
    </ul>
  ),
}));

// Every prop comes from the stores of the Provider below.
const ClientArticleSidebar = (await import("../index"))
  .default as unknown as React.ComponentType;

const renderSidebar = (extraRoots: object[] = []) =>
  render(
    <Provider
      authStore={{ isAdmin: true, isRoomAdmin: false }}
      userStore={{ user: { id: "user-1", isVisitor: false } }}
      treeFoldersStore={{
        treeFolders: [
          { id: 1, title: "My documents", rootFolderType: FolderType.USER },
          { id: 2002, title: "Rooms", rootFolderType: FolderType.Rooms },
          { id: 2003, title: "Archive", rootFolderType: FolderType.Archive },
          ...extraRoots,
        ],
        roomsFolderId: 2002,
        archiveFolderId: 2003,
        myFolderId: 1,
        isTemplatesFolderRoot: false,
        isDocumentsFolder: false,
      }}
      filesStore={{ setSelection: vi.fn(), trashIsEmpty: true }}
      filesActionsStore={{ emptyTrashInProgress: false }}
      dialogsStore={{ setEmptyTrashDialogVisible: vi.fn() }}
      clientLoadingStore={{
        showArticleLoader: false,
        setIsSectionBodyLoading: vi.fn(),
      }}
      settingsStore={{ aiServicesEnabled: true }}
      appsStore={{
        isInstalled: () => true,
        isPrivateRoomsSectionAvailable: true,
        ensureLoaded: vi.fn(),
      }}
    >
      <ClientArticleSidebar />
    </Provider>,
  );

describe("ClientArticleSidebar — Private section", () => {
  it("Private item rendered", () => {
    renderSidebar();

    expect(screen.getByTestId("nav-private-rooms")).toBeInTheDocument();
    expect(screen.getByTestId("nav-private-rooms-archive")).toBeInTheDocument();
  });

  it("Beta badge shown", () => {
    renderSidebar();

    expect(
      within(screen.getByTestId("nav-private-rooms")).getByTestId("beta-badge"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("nav-private-rooms-archive")).queryByTestId(
        "beta-badge",
      ),
    ).toBeNull();
  });

  it("Badge tooltip", () => {
    renderSidebar();

    const badge = within(screen.getByTestId("nav-private-rooms")).getByTestId(
      "beta-badge",
    );
    expect(badge).toHaveAttribute("data-title", "Common:PrivateRoomsBetaTitle");
    expect(badge).toHaveTextContent("Common:PrivateRoomsBetaDescription");
  });
});

describe("ClientArticleSidebar — New-items counter on the section item", () => {
  const privateRoot = (newItems: number) => ({
    id: 2004,
    title: "Private",
    rootFolderType: FolderType.PrivateRooms,
    newItems,
  });

  it("Counter shown", () => {
    renderSidebar([privateRoot(3)]);

    const item = within(screen.getByTestId("nav-private-rooms"));
    const counter = item.getByTestId("new-files-badge");

    expect(counter).toHaveTextContent("3");
    expect(counter).toHaveAttribute("data-folder", "private");
    expect(item.getByTestId("beta-badge")).toBeInTheDocument();
  });

  it("shows no counter while the Private root has nothing new", () => {
    renderSidebar([privateRoot(0)]);

    const item = within(screen.getByTestId("nav-private-rooms"));

    expect(item.queryByTestId("new-files-badge")).toBeNull();
    expect(item.getByTestId("beta-badge")).toBeInTheDocument();
  });

  it("shows no counter when the server lists no Private root", () => {
    renderSidebar();

    expect(
      within(screen.getByTestId("nav-private-rooms")).queryByTestId(
        "new-files-badge",
      ),
    ).toBeNull();
  });
});
