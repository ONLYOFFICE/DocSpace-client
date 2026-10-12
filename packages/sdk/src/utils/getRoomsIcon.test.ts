// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";
import { RoomsType } from "@docspace/shared/enums";

import { getRoomsIcon, getIconBySize } from "./index";

describe("getRoomsIcon", () => {
  it.each([
    [RoomsType.CustomRoom, "/static/images/icons/32/room/custom.svg"],
    [RoomsType.AIRoom, "/static/images/icons/32/room/ai.svg"],
    [RoomsType.EditingRoom, "/static/images/icons/32/room/editing.svg"],
    [RoomsType.PublicRoom, "/static/images/icons/32/room/public.svg"],
    [RoomsType.VirtualDataRoom, "/static/images/icons/32/room/virtual-data.svg"],
    [RoomsType.FormRoom, "/static/images/icons/32/room/form.svg"],
  ])("returns the untouched static url for room type %s", (roomType, url) => {
    expect(getRoomsIcon(roomType, false, 32)).toBe(url);
  });

  it("returns the archive icon for archived rooms", () => {
    expect(getRoomsIcon(RoomsType.CustomRoom, true, 32)).toBe(
      "/static/images/icons/32/room/archive.svg",
    );
  });

  it("falls back to the custom room icon for unknown types", () => {
    expect(getRoomsIcon(0 as RoomsType, false, 32)).toBe(
      "/static/images/icons/32/room/custom.svg",
    );
  });
});

describe("getIconBySize", () => {
  it("falls back to the file icon for unknown paths", () => {
    expect(getIconBySize("unknown.ext.svg", 32)).toBe(
      "/static/images/icons/32/file.svg",
    );
  });
});
