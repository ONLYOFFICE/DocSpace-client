import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getExternalLinks: vi.fn(),
  address: vi.fn(),
  refresh: vi.fn(),
  ready: vi.fn(),
  copyShareLink: vi.fn(),
}));

vi.mock("@docspace/shared/api/rooms", async (io) => ({
  ...((await io()) as object),
  getExternalLinks: mocks.getExternalLinks,
}));
vi.mock(
  "@docspace/shared/services/private-room/private-links",
  async (io) => ({
    ...((await io()) as object),
    readPrivateLinkAddress: mocks.address,
    refreshPrivateLinksReadiness: mocks.refresh,
    isPrivateLinkReady: mocks.ready,
  }),
);
vi.mock("@docspace/shared/components/share/Share.helpers", async (io) => ({
  ...((await io()) as object),
  copyShareLink: mocks.copyShareLink,
}));

import { createTestContextOptionsStore, t } from "./testHarness";
// After the harness, which mocks the toast module.
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

const room = { id: 14, isFolder: true, private: true, roomType: 5 } as never;
const link = (id: string, primary: boolean) => ({
  sharedTo: { id, primary, shareLink: "https://portal.example/s/abc" },
});

const storeOf = (over: Record<string, unknown> = {}) => {
  const setLinkParams = vi.fn();
  const setEditLinkPanelIsVisible = vi.fn();
  const store = createTestContextOptionsStore({
    userStore: { user: { id: "u-1" } },
    filesSettingsStore: { isLinkBlockedByAdmin: () => false },
    publicRoomStore: { setExternalLink: vi.fn() },
    dialogsStore: { setLinkParams, setEditLinkPanelIsVisible },
    ...over,
  });
  return { store, setLinkParams, setEditLinkPanelIsVisible };
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getExternalLinks.mockResolvedValue([]);
  mocks.refresh.mockResolvedValue(undefined);
  mocks.ready.mockReturnValue(true);
  mocks.address.mockResolvedValue("https://portal.example/s/abc#secret");
});

describe("Room context menu: the external link of a private room", () => {
  it("copies the address of the primary link, read from the wrapped secret", async () => {
    const primary = link("2", true);
    mocks.getExternalLinks.mockResolvedValue([link("1", false), primary]);
    const { store } = storeOf();

    await store.onCreateAndCopySharedLink(room, t);

    expect(mocks.address).toHaveBeenCalledWith(room, primary, "u-1");
    expect(mocks.copyShareLink.mock.calls[0][1].sharedTo.shareLink).toBe(
      "https://portal.example/s/abc#secret",
    );
  });

  it("opens the settings of a new link, which ask for its password, when the room has none", async () => {
    const { store, setLinkParams, setEditLinkPanelIsVisible } = storeOf();

    await store.onCreateAndCopySharedLink(room, t);

    expect(setLinkParams.mock.calls[0][0]).toMatchObject({
      link: { sharedTo: { primary: true } },
      item: room,
      privateLinkUserId: "u-1",
    });
    expect(setEditLinkPanelIsVisible).toHaveBeenCalledWith(true);
    expect(mocks.copyShareLink).not.toHaveBeenCalled();
  });

  it("gives no address of a link that is not ready", async () => {
    mocks.getExternalLinks.mockResolvedValue([link("2", true)]);
    mocks.ready.mockReturnValue(false);
    const { store } = storeOf();

    await store.onCreateAndCopySharedLink(room, t);

    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:PrivateLinkNotReady",
    );
    expect(mocks.address).not.toHaveBeenCalled();
  });

  it("gives a text when the wrap of the secret does not open, and none for a link the portal blocks", async () => {
    mocks.getExternalLinks.mockResolvedValue([link("2", true)]);
    mocks.address.mockRejectedValue(new Error("does not open"));

    await storeOf().store.onCreateAndCopySharedLink(room, t);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:PrivateLinkAddressUnavailable",
    );

    mocks.address.mockClear();
    await storeOf({
      filesSettingsStore: { isLinkBlockedByAdmin: () => true },
    }).store.onCreateAndCopySharedLink(room, t);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:LinkBlockedByAdminWarning",
    );
    expect(mocks.address).not.toHaveBeenCalled();
    expect(mocks.copyShareLink).not.toHaveBeenCalled();
  });
});
