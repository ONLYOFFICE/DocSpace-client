import { afterEach, describe, expect, test, vi, type Mock } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { TFilesSettings, TGetFolder } from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";

vi.mock("@docspace/shared/utils/common", () => ({
  frameCallEvent: vi.fn(),
  getFrameId: () => "ds-frame",
}));

vi.mock("@/providers/SDKConfigProvider", () => ({
  useSDKConfig: () => ({ sdkConfig: null }),
}));

vi.mock("../../_store/FilesSettingsStore", () => ({
  useFilesSettingsStore: () => ({ setFilesSettings: vi.fn() }),
}));

vi.mock("../../_store/SettingsStore", () => ({
  useSettingsStore: () => ({
    setShareKey: vi.fn(),
    setDisplayAbout: vi.fn(),
  }),
}));

vi.mock("../_components/list", () => ({ default: () => null }));

import { frameCallEvent } from "@docspace/shared/utils/common";

import PublicRoomPage from "./page.client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const folderList = {
  files: [],
  folders: [],
  total: 0,
  current: { id: 12, rootFolderType: 1 },
  pathParts: [],
} as unknown as TGetFolder;

const page = (displayAbout: boolean) => (
  <PublicRoomPage
    folderList={folderList}
    filesSettings={{} as TFilesSettings}
    portalSettings={{ displayAbout } as TSettings}
    filesFilter=""
    shareKey="share-key"
  />
);

describe("public-room page client", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  afterEach(() => {
    if (root) act(() => root!.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
  });

  test("reports onAppReady to the sdk-js host once on mount", () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => root!.render(page(true)));

    expect(frameCallEvent as Mock).toHaveBeenCalledTimes(1);
    expect(frameCallEvent as Mock).toHaveBeenCalledWith({
      event: "onAppReady",
      data: { frameId: "ds-frame" },
    });

    act(() => root!.render(page(false)));

    expect(frameCallEvent as Mock).toHaveBeenCalledTimes(1);
  });
});
