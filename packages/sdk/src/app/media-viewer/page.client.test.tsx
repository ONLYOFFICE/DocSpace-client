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
import type { TFilesSettings } from "@docspace/shared/api/files/types";
import type { MediaGalleryProps } from "@onlyoffice/apps-ui-kit/media-viewer/MediaGallery.types";
import type { TFile } from "@onlyoffice/apps-ui-kit/media-viewer/MediaViewer.types";

let galleryProps: MediaGalleryProps | undefined;

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@docspace/shared/utils/common", () => ({
  frameCallEvent: vi.fn(),
  getFrameId: () => "ds-frame",
  openUrl: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/media-viewer/MediaGallery", () => ({
  default: (props: MediaGalleryProps) => {
    galleryProps = props;
    return <div data-testid="media-gallery">{props.emptyContent}</div>;
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/empty-screen-container", () => ({
  EmptyScreenContainer: ({ headerText }: { headerText: string }) => (
    <div data-testid="empty-screen">{headerText}</div>
  ),
}));

vi.mock("@onlyoffice/apps-ui-kit/context/ThemeContext", () => ({
  useTheme: () => ({ isBase: true }),
}));

vi.mock("@/components/InvalidLinkError", () => ({
  default: () => <div data-testid="invalid-link" />,
}));

vi.mock("@/providers/SDKConfigProvider", () => ({
  useSDKConfig: () => ({ sdkConfig: null }),
}));

vi.mock("@/app/(docspace)/_hooks/useItemIcon", () => ({
  default: () => ({ getIcon: () => "icon.svg" }),
}));

import { frameCallEvent, openUrl } from "@docspace/shared/utils/common";
import { PAGE_COUNT } from "@/utils/constants";

import MediaViewerClient from "./page.client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const filesSettings = { extsImagePreviewed: [".png"] } as TFilesSettings;

describe("media-viewer page client", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  const render = async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () =>
      root!.render(
        <MediaViewerClient
          folderId="12"
          requestToken="tok"
          startFileId="7"
          filesSettings={filesSettings}
        />,
      ),
    );
  };

  beforeEach(() => {
    galleryProps = undefined;
    (frameCallEvent as Mock).mockReset();
    (openUrl as Mock).mockReset();
  });

  afterEach(() => {
    if (root) act(() => root!.unmount());
    container?.remove();
    root = undefined;
    container = undefined;
  });

  test("reports onAppReady to the sdk-js host once on mount", async () => {
    await render();

    expect(frameCallEvent as Mock).toHaveBeenCalledTimes(1);
    expect(frameCallEvent as Mock).toHaveBeenCalledWith({
      event: "onAppReady",
      data: { frameId: "ds-frame" },
    });
  });

  test("hands the folder, the link key and the start file to the gallery", async () => {
    await render();

    expect(galleryProps).toMatchObject({
      folderId: "12",
      requestToken: "tok",
      startFileId: "7",
      pageSize: PAGE_COUNT,
      extsImagePreviewed: [".png"],
    });
    expect(galleryProps?.getIcon(32, ".png")).toBe("icon.svg");
  });

  test("gives the gallery the empty state for a folder with no media files", async () => {
    await render();

    expect(
      container?.querySelector("[data-testid='empty-screen']")?.textContent,
    ).toBe("Common:NoMediaFiles");
  });

  test("downloads a file by its view url", async () => {
    await render();

    act(() => galleryProps?.onDownload?.({ viewUrl: "/view/1" } as TFile));

    expect(openUrl as Mock).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/view/1", isFrame: true }),
    );
  });

  test("reports onNotFound and shows the invalid link screen for a missing folder", async () => {
    await render();

    act(() => galleryProps?.onLoadError?.({ response: { status: 404 } }));

    expect(frameCallEvent as Mock).toHaveBeenLastCalledWith({
      event: "onNotFound",
    });
    expect(
      container?.querySelector("[data-testid='invalid-link']"),
    ).not.toBeNull();
    expect(container?.querySelector("[data-testid='media-gallery']")).toBeNull();
  });

  test("reports onNoAccess for any other failure", async () => {
    await render();

    act(() => galleryProps?.onLoadError?.({ response: { status: 403 } }));
    expect(frameCallEvent as Mock).toHaveBeenLastCalledWith({
      event: "onNoAccess",
    });
  });

  test("reports onNoAccess when the request never got an answer", async () => {
    await render();

    act(() => galleryProps?.onLoadError?.(new Error("Network Error")));

    expect(frameCallEvent as Mock).toHaveBeenLastCalledWith({
      event: "onNoAccess",
    });
  });
});
