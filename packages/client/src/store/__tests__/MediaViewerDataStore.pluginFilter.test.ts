import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), info: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));

vi.mock("SRC_DIR/helpers/info-panel", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  showInfoPanel: vi.fn(),
  openMembersTab: vi.fn(),
  openShareTab: vi.fn(),
  setView: vi.fn(),
  setFileView: vi.fn(),
  setRoomsView: vi.fn(),
}));

import type { TFile } from "@docspace/shared/api/files/types";

import MediaViewerDataStore from "../MediaViewerDataStore";
import type PluginStore from "../PluginStore";
import type PublicRoomStore from "../PublicRoomStore";
import type FilesStore from "../FilesStore";
import {
  PluginDevices,
  PluginUserRole,
  PluginUsersType,
} from "../../helpers/plugins/enums";

const file = { id: 1, fileExst: ".mp4" } as unknown as TFile;

/** A viewer store whose active plugin filters the playlist by these roles. */
const storeFor = (
  usersTypes: (PluginUserRole | PluginUsersType)[],
  userRole: PluginUserRole,
) =>
  new MediaViewerDataStore(
    {} as unknown as FilesStore,
    {} as unknown as PublicRoomStore,
    {
      pluginMediaViewerVisible: true,
      pluginMediaViewerProps: { playlistFilter: { usersTypes } },
      getUserRole: () => userRole,
      getCurrentDevice: () => PluginDevices.desktop,
    } as unknown as PluginStore,
  );

describe("MediaViewerDataStore playlist filtering by role", () => {
  it("keeps a file when the filter lists the current role", () => {
    const store = storeFor([PluginUserRole.fullAdmin], PluginUserRole.fullAdmin);

    expect(store.filterFilesByPluginCriteria([file])).toEqual([file]);
  });

  it("keeps a file when the filter lists the deprecated role name", () => {
    const store = storeFor(
      [PluginUsersType.docSpaceAdmin],
      PluginUserRole.fullAdmin,
    );

    expect(store.filterFilesByPluginCriteria([file])).toEqual([file]);
  });

  it("drops a file when the filter lists only other roles", () => {
    const store = storeFor([PluginUserRole.owner], PluginUserRole.fullAdmin);

    expect(store.filterFilesByPluginCriteria([file])).toEqual([]);
  });

  it("keeps a file when the filter lists no roles", () => {
    const store = storeFor([], PluginUserRole.guest);

    expect(store.filterFilesByPluginCriteria([file])).toEqual([file]);
  });
});
