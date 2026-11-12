import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock,
} from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type {
  TFile,
  TFilesSettings,
  TGetFolder,
} from "@docspace/shared/api/files/types";
import type { MediaViewerProps } from "@docspace/shared/components/media-viewer/MediaViewer.types";

let viewerProps: MediaViewerProps | undefined;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/utils/common", () => ({
  frameCallEvent: vi.fn(),
  getFrameId: () => "ds-frame",
  openUrl: vi.fn(),
}));

vi.mock("@docspace/shared/api/files", () => ({ getFolder: vi.fn() }));

vi.mock("@docspace/shared/components/media-viewer/MediaViewer", () => ({
  default: (props: MediaViewerProps) => {
    viewerProps = props;
    return <div data-testid="media-viewer" />;
  },
}));

vi.mock(
  "@docspace/shared/components/media-viewer/sub-components/ViewerLoader",
  () => ({ ViewerLoader: () => <div data-testid="viewer-loader" /> }),
);

vi.mock("@onlyoffice/apps-ui-kit/components/empty-screen-container", () => ({
  EmptyScreenContainer: ({ headerText }: { headerText: string }) => (
    <div data-testid="empty-screen">{headerText}</div>
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/context/ThemeContext", () => ({
  useTheme: () => ({ isBase: true }),
}));

vi.mock("@/providers/SDKConfigProvider", () => ({
  useSDKConfig: () => ({ sdkConfig: null }),
}));

vi.mock("@/app/(docspace)/_hooks/useItemIcon", () => ({
  default: () => ({ getIcon: () => "icon.svg" }),
}));

import { getFolder } from "@docspace/shared/api/files";
import { frameCallEvent, openUrl } from "@docspace/shared/utils/common";

import MediaViewerClient from "./page.client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const makeFile = (id: number, isMedia = true) =>
  ({
    id,
    title: `file-${id}.png`,
    fileExst: ".png",
    viewUrl: `/view/${id}`,
    viewAccessibility: { ImageView: isMedia, MediaView: false },
  }) as unknown as TFile;

const makeFolder = (files: TFile[], total = files.length) =>
  ({ files, folders: [], total }) as unknown as TGetFolder;

const filesSettings = { extsImagePreviewed: [".png"] } as TFilesSettings;

describe("media-viewer page client", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  const render = async (folderList: TGetFolder, startFileId?: string) => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () =>
      root!.render(
        <MediaViewerClient
          folderId="12"
          startFileId={startFileId}
          folderList={folderList}
          filesSettings={filesSettings}
        />,
      ),
    );
  };

  beforeEach(() => {
    viewerProps = undefined;
    (frameCallEvent as Mock).mockReset();
    (openUrl as Mock).mockReset();
    (getFolder as Mock).mockReset();
  });

  afterEach(() => {
    if (root) act(() => root!.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
  });

  test("reports onAppReady to the sdk-js host once on mount", async () => {
    await render(makeFolder([makeFile(1)]));

    expect(frameCallEvent as Mock).toHaveBeenCalledTimes(1);
    expect(frameCallEvent as Mock).toHaveBeenCalledWith({
      event: "onAppReady",
      data: { frameId: "ds-frame" },
    });
  });

  test("opens the first media file and skips the files it cannot play", async () => {
    await render(
      makeFolder([makeFile(1, false), makeFile(2), makeFile(3, false), makeFile(4)]),
    );

    expect(viewerProps?.playlist.map((item) => item.fileId)).toEqual([2, 4]);
    expect(viewerProps?.currentFileId).toBe(2);
    expect(viewerProps?.playlistPos).toBe(0);
  });

  test("opens the file given in fileId", async () => {
    await render(makeFolder([makeFile(1), makeFile(2), makeFile(3)]), "3");

    expect(viewerProps?.currentFileId).toBe(3);
    expect(viewerProps?.playlistPos).toBe(2);
  });

  test("moves through the playlist and stops at its ends", async () => {
    await render(makeFolder([makeFile(1), makeFile(2)]));

    act(() => viewerProps?.prevMedia?.());
    expect(viewerProps?.currentFileId).toBe(1);

    act(() => viewerProps?.nextMedia?.());
    expect(viewerProps?.currentFileId).toBe(2);

    act(() => viewerProps?.nextMedia?.());
    expect(viewerProps?.currentFileId).toBe(2);
  });

  test("loads the next page when the end of the playlist is near", async () => {
    (getFolder as Mock).mockResolvedValue(makeFolder([makeFile(2)], 2));

    await render(makeFolder([makeFile(1)], 2));

    const [folderId, filter] = (getFolder as Mock).mock.calls[0];

    expect(getFolder).toHaveBeenCalledTimes(1);
    expect(folderId).toBe("12");
    expect(filter.startIndex).toBe(1);
    expect(viewerProps?.playlist.map((item) => item.fileId)).toEqual([1, 2]);
  });

  test("stops loading after a failed page request", async () => {
    (getFolder as Mock).mockRejectedValue(new Error("network"));

    await render(makeFolder([makeFile(1)], 5));

    expect(getFolder).toHaveBeenCalledTimes(1);
    expect(viewerProps?.playlist).toHaveLength(1);
  });

  test("shows the empty state when the folder has no media files", async () => {
    await render(makeFolder([makeFile(1, false)]));

    expect(viewerProps).toBeUndefined();
    expect(
      container?.querySelector("[data-testid='empty-screen']")?.textContent,
    ).toBe("Common:NoMediaFiles");
  });

  test("downloads the current file by its view url", async () => {
    await render(makeFolder([makeFile(1)]));

    act(() => viewerProps?.onDownload?.(1));

    expect(openUrl as Mock).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/view/1", isFrame: true }),
    );
  });
});
