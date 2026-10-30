import React from "react";
import { Provider } from "mobx-react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import { AiProjectAccess, type TAiProject } from "@docspace/shared/api/ai/projects";

const { toastr, copyShareLink } = vi.hoisted(() => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  copyShareLink: vi.fn(),
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({ toastr }));
vi.mock("@docspace/shared/utils/copy", () => ({ copyShareLink }));

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";

import { useProjectContextMenu } from "../sub-components/useProjectContextMenu";

const ownerSecurity = {
  Read: true,
  Rename: true,
  EditRoom: true,
  EditAccess: true,
  ChangeOwner: true,
  Delete: true,
  Pin: true,
  Mute: true,
  Leave: false,
};

const memberSecurity = {
  ...ownerSecurity,
  Rename: false,
  EditRoom: false,
  EditAccess: false,
  ChangeOwner: false,
  Delete: false,
  Leave: true,
};

const project = (
  access: number,
  security: TAiProject["security"],
  extra: Partial<TAiProject> = {},
): TAiProject =>
  ({
    id: 7,
    title: "Sales",
    access,
    pinned: false,
    mute: false,
    security,
    logo: { color: "#FF6680" },
    aiProject: { profile: null, instructionsRooms: [], knowledgeRooms: [], canEditSettings: true },
    ...extra,
  }) as unknown as TAiProject;

const store = {
  togglePin: vi.fn(async () => {}),
  toggleMute: vi.fn(async () => {}),
  openEditDialog: vi.fn(),
  openLeave: vi.fn(),
  openDelete: vi.fn(),
} as unknown as AiProjectsStore;

const dialogsStore = { setInvitePanelOptions: vi.fn(), setChangeRoomOwnerIsVisible: vi.fn() };
const filesStore = { setBufferSelection: vi.fn() };
const infoPanelStore = { setIsVisible: vi.fn() };

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider dialogsStore={dialogsStore} filesStore={filesStore} infoPanelStore={infoPanelStore}>
    {children}
  </Provider>
);

const renderMenu = (options?: Parameters<typeof useProjectContextMenu>[1]) =>
  renderHook(() => useProjectContextMenu(store, options), { wrapper }).result.current;

/** A menu entry as the assertions read it: the union's option shape. */
type TMenuItem = { key?: string | number; label?: string; onClick?: () => void };
const keys = (model: ContextMenuModel[]) => model.map((item) => item.key);
const item = (model: ContextMenuModel[], key: string): TMenuItem => {
  const found = model.find((entry) => entry.key === key);
  if (!found) throw new Error(`no "${key}" item`);
  return found as TMenuItem;
};

describe("useProjectContextMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("offers the owner everything but Leave, with Open first on the list", () => {
    const onOpen = vi.fn();
    const owner = project(AiProjectAccess.Owner, ownerSecurity);
    const model = renderMenu({ withOpen: true, onOpen })(owner);
    expect(keys(model)).toEqual([
      "open",
      "sep-open",
      "pin",
      "mute",
      "sep-edit",
      "edit",
      "invite",
      "change-owner",
      "copy-link",
      "info",
      "sep-delete",
      "delete",
    ]);
    item(model, "open").onClick?.();
    expect(onOpen).toHaveBeenCalledWith(owner);
  });

  it("offers a member pin, notifications, link, info and Leave only", () => {
    const member = project(AiProjectAccess.Member, memberSecurity, { pinned: true, mute: true });
    const model = renderMenu()(member);
    expect(keys(model)).toEqual(["pin", "unmute", "copy-link", "info", "sep-leave", "leave"]);
    expect(item(model, "pin").label).toBe("Common:Unpin");
    expect(item(model, "unmute").label).toBe("Common:EnableNotifications");
    item(model, "leave").onClick?.();
    expect(store.openLeave).toHaveBeenCalledWith(member);
  });

  it("never offers the owner Leave, whatever the server's flag says", () => {
    const model = renderMenu()(
      project(AiProjectAccess.Owner, { ...ownerSecurity, Leave: true }),
    );
    expect(keys(model)).not.toContain("leave");
  });

  it("routes the items to the store and the room panels", () => {
    const owner = project(AiProjectAccess.Owner, ownerSecurity);
    const model = renderMenu()(owner);

    item(model, "pin").onClick?.();
    expect(store.togglePin).toHaveBeenCalledWith(owner);
    item(model, "edit").onClick?.();
    expect(store.openEditDialog).toHaveBeenCalledWith(owner);
    item(model, "delete").onClick?.();
    expect(store.openDelete).toHaveBeenCalledWith(owner);

    item(model, "invite").onClick?.();
    expect(dialogsStore.setInvitePanelOptions).toHaveBeenCalledWith({
      visible: true,
      roomId: 7,
      hideSelector: false,
      defaultAccess: AiProjectAccess.Member,
    });

    item(model, "change-owner").onClick?.();
    expect(filesStore.setBufferSelection).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, isAIProject: true, isRoom: true }),
    );
    expect(dialogsStore.setChangeRoomOwnerIsVisible).toHaveBeenCalledWith(true);

    item(model, "info").onClick?.();
    expect(infoPanelStore.setIsVisible).toHaveBeenCalledWith(true);
    expect(filesStore.setBufferSelection).toHaveBeenCalledTimes(2);

    item(model, "copy-link").onClick?.();
    expect(copyShareLink).toHaveBeenCalledWith(`${window.location.origin}/ai-projects/7`);
    expect(toastr.success).toHaveBeenCalledWith("Common:LinkCopySuccess");
  });

  it("reports the notifications switch, and its failure", async () => {
    const owner = project(AiProjectAccess.Owner, ownerSecurity);
    item(renderMenu()(owner), "mute").onClick?.();
    await vi.waitFor(() =>
      expect(toastr.success).toHaveBeenCalledWith("Common:AIProjectNotificationsDisabled"),
    );

    (store.toggleMute as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("offline"));
    item(renderMenu()(owner), "mute").onClick?.();
    await vi.waitFor(() => expect(toastr.error).toHaveBeenCalledWith("offline"));
  });
});
