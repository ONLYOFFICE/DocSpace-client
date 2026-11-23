import { beforeEach, describe, expect, it, vi } from "vitest";

import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { TRoom } from "@docspace/shared/api/rooms/types";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    socketSubscribers: new Set<string>(),
  },
}));
vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (k: string) => k, exists: () => true, language: "en" },
}));

const infoPanel = vi.hoisted(() => ({ showInfoPanel: vi.fn(), openMembersTab: vi.fn() }));
vi.mock("SRC_DIR/helpers/info-panel", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  ...infoPanel,
}));
vi.mock("@docspace/shared/utils", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  isDesktop: () => true,
}));

const CreateEditRoomStore = (await import("../CreateEditRoomStore")).default;

/** CreateEditRoomStore with only the deps onOpenNewRoom touches. */
const createStore = (roomId: number) => {
  const deps = Array.from({ length: 11 }, () => ({})) as Record<string, unknown>[];
  deps[0] = {
    setSelection: vi.fn(),
    selectedFolderStore: { id: roomId },
    isPrivateRoomsSectionAvailable: false,
  };
  deps[7] = { setIsSectionBodyLoading: vi.fn() };
  return new CreateEditRoomStore(
    ...(deps as unknown as ConstructorParameters<typeof CreateEditRoomStore>),
  );
};

const room = (roomType: RoomsType, rootFolderType = FolderType.AiHub) =>
  ({ id: 5, title: "New", roomType, rootFolderType }) as unknown as TRoom;

describe("CreateEditRoomStore.onOpenNewRoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as unknown as { DocSpace: unknown }).DocSpace = { navigate: vi.fn() };
  });

  it("opens a new room on its contacts in the Info panel", async () => {
    await createStore(5).onOpenNewRoom(room(RoomsType.CustomRoom, FolderType.Rooms));

    expect(infoPanel.showInfoPanel).toHaveBeenCalledTimes(1);
    expect(infoPanel.openMembersTab).toHaveBeenCalledTimes(1);
  });

  it.each([RoomsType.InstructionsRoom, RoomsType.KnowledgeRoom])(
    "leaves the Info panel as it was for a new room of type %s",
    async (roomType) => {
      await createStore(5).onOpenNewRoom(room(roomType));

      expect(
        (window as unknown as { DocSpace: { navigate: ReturnType<typeof vi.fn> } }).DocSpace
          .navigate.mock.calls[0][0],
      ).toContain("/ai-rooms/5/filter");
      expect(infoPanel.showInfoPanel).not.toHaveBeenCalled();
      expect(infoPanel.openMembersTab).not.toHaveBeenCalled();
    },
  );
});
