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

import React, { act, Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TFile } from "@docspace/shared/api/files/types";
import type { TUser } from "@docspace/shared/api/people/types";

import type { EditorProps, IInitialConfig } from "@/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

type TEditorConfig = {
  events?: Record<string, unknown>;
  editorConfig?: Record<string, unknown>;
  document?: Record<string, unknown>;
};

const env = vi.hoisted(() => {
  const handler = () => vi.fn();
  return {
    captured: { config: undefined as TEditorConfig | undefined },
    encryption: {
      status: "off" as "off" | "loading" | "ready" | "error",
      encryptionKeys: undefined as Record<string, unknown> | undefined,
    },
    events: {
      createUrl: "",
      documentReady: false,
      usersInRoom: [],
      onDocumentReady: handler(),
      onUserActionRequired: handler(),
      onSDKRequestOpen: handler(),
      onSDKRequestReferenceData: handler(),
      onSDKAppReady: handler(),
      onSDKRequestClose: handler(),
      onSDKRequestCreateNew: handler(),
      onSDKRequestHistory: handler(),
      onSDKRequestUsers: handler(),
      onSDKRequestSendNotify: handler(),
      onSDKRequestRestore: handler(),
      onSDKRequestHistoryData: handler(),
      onDocumentStateChange: handler(),
      onMetaChange: handler(),
      onMakeActionLink: handler(),
      setDocTitle: handler(),
      onSubmit: handler(),
      onRequestFillingStatus: handler(),
      onRequestStartFilling: handler(),
      onRequestRefreshFile: handler(),
      onInfo: handler(),
    },
    eventHelpers: {
      onSDKRequestHistoryClose: vi.fn(),
      onSDKRequestEditRights: vi.fn(),
      onSDKWarning: vi.fn(),
      onSDKError: vi.fn(),
      onSDKRequestRename: vi.fn(),
    },
    useAIAttachFile: vi.fn(),
  };
});

vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<unknown>) =>
    React.lazy(async () => {
      const loaded = (await loader()) as
        | React.ComponentType
        | { default: React.ComponentType };
      return "default" in loaded ? loaded : { default: loaded };
    }),
}));

vi.mock("@onlyoffice/apps-ui-kit/document-editor", () => ({
  DocumentEditor: ({ config }: { config: TEditorConfig }) => {
    env.captured.config = config;
    return <div data-testid="document-editor" />;
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/context/ThemeContext", () => ({
  useTheme: () => ({ isBase: true }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: {} }),
}));

vi.mock("@docspace/shared/hooks/useResolvedFileTitle", () => ({
  useResolvedFileTitle: (file: { title?: string } | null) => file?.title,
}));

vi.mock("@docspace/shared/utils", () => ({
  getEditorTheme: () => "theme-light",
}));

vi.mock("@docspace/shared/utils/oauthToken", () => ({
  isOAuthFrame: () => false,
}));

vi.mock("@docspace/shared/constants", () => ({
  EDITOR_ID: "portal_editor",
}));

vi.mock("@/hooks/useEditorEvents", () => ({
  default: () => env.events,
}));

vi.mock("@/hooks/useInit", () => ({ default: vi.fn() }));

vi.mock("@/hooks/useAIAttachFile", () => ({
  default: (args: unknown) => env.useAIAttachFile(args),
}));

vi.mock("@/hooks/useGoBackAndClose", () => ({
  default: () => ({ goBack: {}, close: undefined }),
}));

vi.mock("@/hooks/useFileEncryptionKeys", () => ({
  default: () => env.encryption,
}));

vi.mock("@/utils/events", () => env.eventHelpers);

vi.mock("@/utils", () => ({
  isPDFDocument: (file?: { fileExst?: string; isForm?: boolean }) =>
    file?.fileExst === ".pdf" && !file?.isForm,
}));

vi.mock("@/components/Bar", () => ({ default: () => null }));

import Editor from "../Editor";

const USER_ID = "11111111-1111-1111-1111-111111111111";

const makeConfig = (encrypted: boolean, extra: Partial<IInitialConfig> = {}) =>
  ({
    document: {
      title: encrypted ? "a1b2c3d4e5f6.docx" : "Plain.docx",
      url: "http://portal.test/api/2.0/files/file/7/download",
    },
    documentType: "word",
    editorConfig: { mode: "edit", customization: {} },
    editorType: "0",
    editorUrl: "http://portal.test/ds-vpath",
    file: { id: 7, encrypted },
    token: "t",
    type: "desktop",
    ...extra,
  }) as unknown as IInitialConfig;

const makeFileInfo = (
  encrypted: boolean,
  security: Partial<TFile["security"]> = {},
  extra: Partial<TFile> = {},
) =>
  ({
    id: 7,
    title: encrypted ? "a1b2c3d4e5f6.docx" : "Plain.docx",
    fileExst: ".docx",
    encrypted,
    security: {
      Rename: true,
      ReadHistory: false,
      EditHistory: false,
      ...security,
    },
    ...extra,
  }) as unknown as TFile;

const user = { id: USER_ID, isVisitor: false } as TUser;

describe("Editor", () => {
  let root: Root | null = null;
  let container: HTMLElement | null = null;

  const renderEditor = async (props: Partial<EditorProps>) => {
    const all: EditorProps = {
      documentServerUrl: "http://ds.test/",
      successAuth: true,
      user,
      isSharingAccess: true,
      onSDKRequestSaveAs: vi.fn(),
      onSDKRequestSharingSettings: vi.fn(),
      onSDKRequestInsertImage: vi.fn(),
      onSDKRequestSelectSpreadsheet: vi.fn(),
      onSDKRequestSelectDocument: vi.fn(),
      onSDKRequestReferenceSource: vi.fn(),
      onStartFilling: vi.fn(),
      ...props,
    };
    container = document.createElement("div");
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <Suspense fallback={null}>
          <Editor {...all} />
        </Suspense>,
      );
    });
    for (let i = 0; i < 10 && !env.captured.config; i += 1) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    }
    return all;
  };

  const events = () => env.captured.config?.events ?? {};

  beforeEach(() => {
    env.captured.config = undefined;
    env.encryption.status = "off";
    env.encryption.encryptionKeys = undefined;
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    container = null;
  });

  const editorMounted = () =>
    !!container?.querySelector(`[data-testid="document-editor"]`);

  const asEncrypted = () => {
    env.encryption.status = "ready";
    env.encryption.encryptionKeys = {
      dek: "ZGVr",
      cryptoEngineId: "engine",
      contractVersion: 1,
    };
  };

  describe("Save copy as", () => {
    it("Save copy as: the event is absent for an encrypted file", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true),
        fileInfo: makeFileInfo(true),
      });

      expect(env.captured.config).toBeDefined();
      expect(events().onRequestSaveAs).toBeUndefined();
    });

    it("Save copy as: the event is present for a plain file", async () => {
      const props = await renderEditor({
        config: makeConfig(false),
        fileInfo: makeFileInfo(false),
      });

      expect(events().onRequestSaveAs).toBe(props.onSDKRequestSaveAs);
    });
  });

  describe("Version history", () => {
    const HISTORY_EVENTS = [
      "onRequestHistory",
      "onRequestRestore",
      "onRequestHistoryData",
      "onRequestHistoryClose",
    ];

    it("History rights on an encrypted file: no history event is attached", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true),
        fileInfo: makeFileInfo(true, { ReadHistory: true, EditHistory: true }),
      });

      expect(env.captured.config).toBeDefined();
      for (const name of HISTORY_EVENTS) {
        expect(events()[name], name).toBeUndefined();
      }
    });

    it("History rights on a plain file: every history event is attached", async () => {
      await renderEditor({
        config: makeConfig(false),
        fileInfo: makeFileInfo(false, { ReadHistory: true, EditHistory: true }),
      });

      for (const name of HISTORY_EVENTS) {
        expect(events()[name], name).toEqual(expect.any(Function));
      }
    });
  });

  describe("Share to fill out", () => {
    const pdfForm = (encrypted: boolean) =>
      makeFileInfo(encrypted, {}, { fileExst: ".pdf", isForm: true });

    it("Form opened in a private room: no start-filling event is attached", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true, { startFilling: true }),
        fileInfo: pdfForm(true),
      });

      expect(env.captured.config).toBeDefined();
      expect(events().onRequestStartFilling).toBeUndefined();
      expect(events().onStartFilling).toBeUndefined();
    });

    it("Form opened outside a private room: the start-filling events are attached", async () => {
      const props = await renderEditor({
        config: makeConfig(false, { startFilling: true }),
        fileInfo: pdfForm(false),
      });

      expect(events().onRequestStartFilling).toBe(env.events.onRequestStartFilling);
      expect(events().onStartFilling).toBe(props.onStartFilling);
    });
  });

  describe("Refresh", () => {
    it("Refresh requested on an encrypted file: the refresh event is absent", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true),
        fileInfo: makeFileInfo(true),
      });

      expect(env.captured.config).toBeDefined();
      expect(events().onRequestRefreshFile).toBeUndefined();
    });

    it("Refresh requested on a plain file: the refresh event is attached", async () => {
      await renderEditor({
        config: makeConfig(false),
        fileInfo: makeFileInfo(false),
      });

      expect(events().onRequestRefreshFile).toBe(env.events.onRequestRefreshFile);
    });
  });

  describe("Rename", () => {
    it("Rename requested on an encrypted file: the rename event is absent", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true),
        fileInfo: makeFileInfo(true, { Rename: true }),
      });

      expect(env.captured.config).toBeDefined();
      expect(events().onRequestRename).toBeUndefined();
    });

    it("Rename requested on a plain file: the rename event writes the title", async () => {
      await renderEditor({
        config: makeConfig(false),
        fileInfo: makeFileInfo(false, { Rename: true }),
      });

      const onRequestRename = events().onRequestRename as (e: object) => void;
      expect(onRequestRename).toEqual(expect.any(Function));
      onRequestRename({ data: "Renamed.docx" });
      expect(env.eventHelpers.onSDKRequestRename).toHaveBeenCalledWith(
        { data: "Renamed.docx" },
        7,
      );
    });
  });

  describe("Sharing", () => {
    it("Sharing requested on an encrypted file: the sharing event is absent", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true),
        fileInfo: makeFileInfo(true),
        isSharingAccess: true,
      });

      expect(env.captured.config).toBeDefined();
      expect(events().onRequestSharingSettings).toBeUndefined();
    });

    it("Sharing requested on a plain file: the sharing event is attached", async () => {
      const props = await renderEditor({
        config: makeConfig(false),
        fileInfo: makeFileInfo(false),
        isSharingAccess: true,
      });

      expect(events().onRequestSharingSettings).toBe(
        props.onSDKRequestSharingSettings,
      );
    });
  });

  describe("Frame errors", () => {
    const libraryMissing = {
      data: {
        errorCode: "-1",
        errorDescription: "The crypto library is missing in the frame",
      },
    };

    it("Library missing in the frame: the error replaces the editor as page text", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true),
        fileInfo: makeFileInfo(true),
      });
      expect(editorMounted()).toBe(true);

      const onError = events().onError as (event: object) => void;
      await act(async () => onError(libraryMissing));

      expect(env.eventHelpers.onSDKError).toHaveBeenCalledWith(libraryMissing);
      expect(editorMounted()).toBe(false);
      expect(container?.textContent).toContain("Common:SomethingWentWrong");
      expect(container?.textContent).toContain(
        libraryMissing.data.errorDescription,
      );
    });

    it("Frame error on a plain file: the editor stays mounted and the error is logged", async () => {
      await renderEditor({
        config: makeConfig(false),
        fileInfo: makeFileInfo(false),
      });

      const onError = events().onError as (event: object) => void;
      await act(async () => onError(libraryMissing));

      expect(env.eventHelpers.onSDKError).toHaveBeenCalledWith(libraryMissing);
      expect(editorMounted()).toBe(true);
    });
  });

  describe("AI attach", () => {
    it("Encrypted file opened: the AI attach listener is not enabled", async () => {
      asEncrypted();
      await renderEditor({
        config: makeConfig(true),
        fileInfo: makeFileInfo(true),
      });

      expect(env.useAIAttachFile).toHaveBeenCalled();
      expect(env.useAIAttachFile).toHaveBeenLastCalledWith(
        expect.objectContaining({ enabled: false }),
      );
    });

    it("Plain file opened: the AI attach listener is enabled for a member", async () => {
      await renderEditor({
        config: makeConfig(false),
        fileInfo: makeFileInfo(false),
      });

      expect(env.useAIAttachFile).toHaveBeenLastCalledWith(
        expect.objectContaining({ enabled: true }),
      );
    });
  });
});
