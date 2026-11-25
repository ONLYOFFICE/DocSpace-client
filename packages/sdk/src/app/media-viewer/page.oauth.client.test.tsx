import { beforeEach, describe, expect, test, vi } from "vitest";

type OAuthState = {
  result: { data: unknown; error: Error | null };
  load?: () => Promise<unknown>;
};

const state = vi.hoisted(() => {
  const initial: OAuthState = { result: { data: null, error: null } };
  return initial;
});

vi.mock("@/hooks/useOAuthSSRData", () => ({
  useOAuthSSRData: (load: () => Promise<unknown>) => {
    state.load = load;
    return state.result;
  },
}));

const getSettingsFiles = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/api/files", () => ({ getSettingsFiles }));

vi.mock("@/utils/private-room-address", () => ({
  getPrivateRoomAddress: vi.fn(),
}));

vi.mock("@/components/OAuthPageLoader", () => ({ default: () => null }));
vi.mock("@/components/PrivateTargetNotAvailable", () => ({
  default: () => null,
}));
vi.mock("./page.client", () => ({ default: () => null }));
vi.mock("./page.error.client", () => ({ default: () => null }));

import OAuthPageLoader from "@/components/OAuthPageLoader";
import PrivateTargetNotAvailable from "@/components/PrivateTargetNotAvailable";
import { getPrivateRoomAddress } from "@/utils/private-room-address";

import MediaViewerOAuthPage from "./page.oauth.client";
import MediaViewerClient from "./page.client";
import MediaViewerError from "./page.error.client";

const filesSettings = { extsImagePreviewed: [".png"] };

const render = (folderId = "12") =>
  MediaViewerOAuthPage({ folderId, requestToken: "tok", startFileId: "7" });

describe("media-viewer page in an OAuth frame", () => {
  beforeEach(() => {
    state.result = { data: null, error: null };
    state.load = undefined;
    vi.mocked(getPrivateRoomAddress).mockReset().mockResolvedValue(null);
    getSettingsFiles.mockReset();
  });

  test("shows the loader until the data comes", () => {
    expect(render().type).toBe(OAuthPageLoader);
  });

  test("renders the gallery with the loaded file settings", () => {
    state.result = { data: { filesSettings }, error: null };

    const element = render();

    expect(element.type).toBe(MediaViewerClient);
    expect(element.props).toEqual({
      folderId: "12",
      requestToken: "tok",
      startFileId: "7",
      filesSettings,
    });
  });

  test("reports onNoAccess instead of throwing when the data cannot be loaded", () => {
    state.result = { data: null, error: new Error("Failed") };

    const element = render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
  });

  test("reports onNotFound when the folder is missing", () => {
    state.result = {
      data: null,
      error: Object.assign(new Error("Not found"), {
        response: { status: 404 },
      }),
    };

    expect(render().props.event).toBe("onNotFound");
  });

  test("shows the not-available view for a folder of a private room", async () => {
    state.result = { data: { privateTarget: true }, error: null };

    expect(render().type).toBe(PrivateTargetNotAvailable);

    vi.mocked(getPrivateRoomAddress).mockResolvedValue("/private/19");

    await expect(state.load?.()).resolves.toEqual({ privateTarget: true });
    expect(getPrivateRoomAddress).toHaveBeenCalledWith({ id: "12" }, {});
    expect(getSettingsFiles).not.toHaveBeenCalled();
  });

  test("loads the file settings for a folder outside private rooms", async () => {
    getSettingsFiles.mockResolvedValue(filesSettings);

    render();

    await expect(state.load?.()).resolves.toEqual({ filesSettings });
  });

  test("does not look for a private room behind an alias", async () => {
    getSettingsFiles.mockResolvedValue(filesSettings);

    render("@my");
    await state.load?.();

    expect(getPrivateRoomAddress).not.toHaveBeenCalled();
  });
});
