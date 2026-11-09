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

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { observable, runInAction } from "mobx";
import { Provider } from "mobx-react";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type TDeferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const deferred = <T,>(): TDeferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const mocks = vi.hoisted(() => ({
  runEncryptedFileCreation: vi.fn(),
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (key: string) => key, exists: () => true, language: "en" },
}));

vi.mock("SRC_DIR/helpers/encryptedFileCreation", () => ({
  runEncryptedFileCreation: mocks.runEncryptedFileCreation,
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: mocks.toastr,
}));

type TModalProps = {
  visible: boolean;
  withForm?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
  children?: React.ReactNode;
};

vi.mock("@onlyoffice/apps-ui-kit/components/modal-dialog", () => {
  const ModalDialog = ({ visible, onSubmit, children }: TModalProps) =>
    visible ? (
      <div role="dialog">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(e);
          }}
        >
          {children}
        </form>
      </div>
    ) : null;
  const Part = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  ModalDialog.Header = Part;
  ModalDialog.Body = Part;
  ModalDialog.Footer = Part;
  return { ModalDialog };
});

const { RoomsType } = await import("@docspace/shared/enums");
const api = (await import("@docspace/shared/api")).default;

const CreateEvent = (await import("../CreateEvent"))
  .default as unknown as React.ComponentType<Record<string, unknown>>;

type TCreated = { fileId: number } | null;

const ROOM_ID = 20;

const createStores = ({
  keepNewFileName = false,
  isPrivacy = true,
  roomType = undefined,
}: {
  keepNewFileName?: boolean;
  isPrivacy?: boolean;
  roomType?: (typeof RoomsType)[keyof typeof RoomsType];
} = {}) => {
  const filesSettingsStore = observable(
    {
      keepNewFileName,
      openOnNewPage: true,
      setKeepNewFileName: vi.fn(async (value: boolean) => {
        runInAction(() => {
          filesSettingsStore.keepNewFileName = value;
        });
        return value;
      }),
    },
    { setKeepNewFileName: false },
  );

  const dialogsStore = observable(
    {
      eventDialogVisible: false,
      setEventDialogVisible: (visible: boolean) => {
        dialogsStore.eventDialogVisible = visible;
      },
      setConvertPasswordDialogVisible: vi.fn(),
      setFormCreationInfo: vi.fn(),
    },
    { setConvertPasswordDialogVisible: false, setFormCreationInfo: false },
  );

  const createFile = vi.fn();

  return {
    filesSettingsStore,
    dialogsStore,
    settingsStore: {
      isDesktopClient: false,
      isFrame: false,
      frameConfig: null,
      folderFormValidation: /[*+:"<>?|\\/]/gim,
    },
    filesStore: {
      createFile,
      addActiveItems: vi.fn(),
      setIsUpdatingRowItem: vi.fn(),
      setCreatedItem: vi.fn(),
      files: [],
      fetchFiles: vi.fn(async () => undefined),
      openDocEditor: vi.fn(),
    },
    filesActionsStore: { completeAction: vi.fn(), openItemAction: vi.fn() },
    selectedFolderStore: {
      id: ROOM_ID,
      isIndexedFolder: false,
      navigationPath: [],
      isRoom: true,
      roomType,
    },
    treeFoldersStore: { isRecycleBinFolder: false, isPrivacyFolder: isPrivacy },
    uploadDataStore: {
      clearActiveOperations: vi.fn(),
      fileCopyAs: vi.fn(),
      getUserEncryptionKeys: () => ({
        userId: "user-1",
        publicKey: "public-key",
        publicKeyId: "key-1",
      }),
    },
    oformsStore: { gallerySelected: null, setGallerySelected: vi.fn() },
    currentTariffStatusStore: { setPortalTariff: vi.fn() },
    publicRoomStore: { publicRoomKey: null },
    pluginStore: { openMarkdownFile: vi.fn(async () => undefined) },
  };
};

type TStores = ReturnType<typeof createStores>;

const createRequest = (extension: string, overrides = {}) => ({
  visible: true,
  id: -1,
  type: "create",
  extension,
  title: null,
  templateId: null,
  fromTemplate: null,
  withoutDialog: false,
  preview: false,
  actionEdit: false,
  openEditor: true,
  toForm: false,
  onClose: vi.fn(),
  ...overrides,
});

const renderCreateEvent = (
  stores: TStores,
  request: ReturnType<typeof createRequest>,
) => {
  const view = render(
    <Provider {...stores}>
      <CreateEvent {...request} />
    </Provider>,
  );

  return {
    rerender: (next: ReturnType<typeof createRequest>) =>
      view.rerender(
        <Provider {...stores}>
          <CreateEvent {...next} />
        </Provider>,
      ),
  };
};

const tickDontAskAgainAndCreate = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(
    screen.getByRole("checkbox", { name: "Common:DontAskAgain" }),
  );
  await user.click(screen.getByRole("button", { name: "Common:Create" }));
};

const flush = () => act(async () => {});

const createdTitles = () =>
  mocks.runEncryptedFileCreation.mock.calls.map(
    ([params]) => (params as { title: string }).title,
  );

describe("CreateEvent - one create action makes one file", () => {
  let creations: TDeferred<TCreated>[];

  beforeEach(() => {
    creations = [];
    mocks.runEncryptedFileCreation.mockImplementation(() => {
      const creation = deferred<TCreated>();
      creations.push(creation);
      return creation.promise;
    });
    vi.spyOn(window, "open").mockImplementation(
      () => ({ close: vi.fn() }) as unknown as Window,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Don't ask again ticked in the name dialog", async () => {
    const user = userEvent.setup();
    const stores = createStores();
    renderCreateEvent(stores, createRequest("pptx"));

    await tickDontAskAgainAndCreate(user);
    await flush();

    expect(stores.filesSettingsStore.setKeepNewFileName).toHaveBeenCalledWith(
      true,
    );
    expect(stores.filesSettingsStore.keepNewFileName).toBe(true);

    await act(async () => {
      for (const creation of creations) creation.resolve({ fileId: 16 });
    });

    expect(mocks.runEncryptedFileCreation).toHaveBeenCalledTimes(1);
    expect(createdTitles()).toEqual(["Common:NewPresentation"]);
    expect(stores.filesStore.openDocEditor).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledTimes(1);
  });

  it("Name typed and Don't ask again ticked", async () => {
    const user = userEvent.setup();
    const stores = createStores();
    renderCreateEvent(stores, createRequest("pptx"));

    const input = screen.getByRole("searchbox");
    await user.clear(input);
    await user.type(input, "Q4 plan");
    await tickDontAskAgainAndCreate(user);
    await flush();

    await act(async () => {
      for (const creation of creations) creation.resolve({ fileId: 16 });
    });

    expect(createdTitles()).toEqual(["Q4 plan"]);
  });

  it("Dialog during the creation", async () => {
    const user = userEvent.setup();
    const stores = createStores();
    const request = createRequest("pptx");
    renderCreateEvent(stores, request);

    await tickDontAskAgainAndCreate(user);
    await flush();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Common:Create" }),
    ).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      creations[0].resolve({ fileId: 16 });
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(request.onClose).toHaveBeenCalledTimes(1);
  });

  it("File names not asked", async () => {
    const stores = createStores({ keepNewFileName: true });
    renderCreateEvent(stores, createRequest("docx"));
    await flush();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await act(async () => {
      for (const creation of creations) creation.resolve({ fileId: 16 });
    });

    expect(createdTitles()).toEqual(["Common:NewDocument"]);
    expect(stores.filesStore.openDocEditor).toHaveBeenCalledTimes(1);
  });

  it("Another file type requested during a creation", async () => {
    const stores = createStores({ keepNewFileName: true });
    const view = renderCreateEvent(stores, createRequest("pptx"));
    await flush();

    view.rerender(createRequest("xlsx"));
    await flush();

    await act(async () => {
      for (const creation of creations) creation.resolve({ fileId: 16 });
    });

    expect(createdTitles()).toEqual([
      "Common:NewPresentation",
      "Common:NewSpreadsheet",
    ]);
  });

  it("Form room: Don't ask again ticked", async () => {
    const user = userEvent.setup();
    const stores = createStores({ isPrivacy: false });
    const created = deferred<{ id: number; folderId: number }>();
    stores.filesStore.createFile.mockReturnValue(created.promise);
    renderCreateEvent(stores, createRequest("pdf", { openEditor: false }));

    await tickDontAskAgainAndCreate(user);
    await flush();

    await act(async () => {
      created.resolve({ id: 30, folderId: ROOM_ID });
    });

    expect(stores.filesStore.createFile).toHaveBeenCalledTimes(1);
    expect(mocks.runEncryptedFileCreation).not.toHaveBeenCalled();
  });
});

describe("CreateEvent - a Markdown file opens in the Markdown plugin", () => {
  beforeEach(() => {
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Folder: created empty and opened in the plugin", async () => {
    const stores = createStores({ keepNewFileName: true, isPrivacy: false });
    const file = { id: 40, folderId: ROOM_ID, fileExst: ".md" };
    stores.filesStore.createFile.mockResolvedValue(file);
    renderCreateEvent(stores, createRequest("md"));
    await flush();

    expect(stores.filesStore.createFile).toHaveBeenCalledWith(
      ROOM_ID,
      "Common:NewMarkdown.md",
    );
    expect(stores.pluginStore.openMarkdownFile).toHaveBeenCalledWith(file);
    expect(window.open).not.toHaveBeenCalled();
    expect(stores.filesStore.openDocEditor).not.toHaveBeenCalled();
  });

  it("Instructions room: created with the skill frontmatter", async () => {
    const stores = createStores({
      keepNewFileName: true,
      isPrivacy: false,
      roomType: RoomsType.InstructionsRoom,
    });
    const file = { id: 41, folderId: ROOM_ID, fileExst: ".md" };
    const insertFile = vi
      .spyOn(api.files, "insertFile")
      .mockResolvedValue(file as never);
    renderCreateEvent(stores, createRequest("md"));
    await flush();

    expect(stores.filesStore.createFile).not.toHaveBeenCalled();
    expect(insertFile).toHaveBeenCalledTimes(1);
    const [folderId, title, content] = insertFile.mock.calls[0];
    expect(folderId).toBe(ROOM_ID);
    expect(title).toBe("Common:NewMarkdown.md");
    // jsdom's Blob has no text()
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsText(content as Blob);
    });
    expect(text).toBe(
      '---\nname: common-newmarkdown\ndescription: "Common:NewMarkdown"\n---\n\n',
    );
    expect(stores.pluginStore.openMarkdownFile).toHaveBeenCalledWith(file);
  });
});
