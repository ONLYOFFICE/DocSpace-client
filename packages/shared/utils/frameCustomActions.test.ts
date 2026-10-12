// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, expect, it, vi } from "vitest";

import { FolderType } from "@onlyoffice/apps-ui-kit/enums";

import type { TFrameCustomActions } from "../types/Frame";

const frameCallEvent = vi.fn();
vi.mock("./common", () => ({
  frameCallEvent: (data: unknown) => frameCallEvent(data),
}));

import {
  getManagerSection,
  getVisibleContextActions,
  getVisibleCreateActions,
  getVisibleGroupContextActions,
  sendCustomAction,
  getCustomActionIconProps,
} from "./frameCustomActions";

const config: TFrameCustomActions = {
  contextMenu: {
    file: [
      { key: "any", label: "Any file" },
      { key: "docs", label: "Docs only", extensions: ["DOCX", ".pdf"] },
      { key: "download", label: "Needs download", requireSecurity: ["Download"] },
      { key: "rooms", label: "Rooms section", section: ["rooms"] },
    ],
    room: [{ key: "custom", label: "Custom rooms", roomTypes: [5] }],
  },
  createMenu: [
    { key: "everywhere", label: "Everywhere" },
    { key: "mine", label: "My documents", section: ["my-documents"] },
  ],
};

const keys = (actions: { key: string }[]) => actions.map((a) => a.key);

describe("getVisibleContextActions", () => {
  it("matches extensions case-insensitively with or without the dot", () => {
    expect(
      keys(getVisibleContextActions(config, "file", { fileExst: ".docx" })),
    ).toEqual(["any", "docs"]);
    expect(
      keys(getVisibleContextActions(config, "file", { fileExst: ".xlsx" })),
    ).toEqual(["any"]);
  });

  it("requires every listed security flag to be true", () => {
    expect(
      keys(
        getVisibleContextActions(config, "file", {
          fileExst: ".txt",
          security: { Download: true },
        }),
      ),
    ).toEqual(["any", "download"]);
  });

  it("limits actions to the listed sections", () => {
    expect(
      keys(getVisibleContextActions(config, "file", { fileExst: ".txt" }, "rooms")),
    ).toEqual(["any", "rooms"]);
  });

  it("filters rooms by room type", () => {
    expect(keys(getVisibleContextActions(config, "room", { roomType: 5 }))).toEqual([
      "custom",
    ]);
    expect(getVisibleContextActions(config, "room", { roomType: 6 })).toEqual([]);
  });

  it("returns nothing without a config", () => {
    expect(getVisibleContextActions(undefined, "file", {})).toEqual([]);
  });
});

describe("getVisibleGroupContextActions", () => {
  it("keeps the actions every selected item satisfies", () => {
    expect(
      keys(
        getVisibleGroupContextActions(config, [
          { type: "file", item: { fileExst: ".docx" } },
          { type: "file", item: { fileExst: ".pdf" } },
        ]),
      ),
    ).toEqual(["any", "docs"]);
  });

  it("shows nothing for a mixed selection", () => {
    expect(
      getVisibleGroupContextActions(config, [
        { type: "file", item: {} },
        { type: "room", item: { roomType: 5 } },
      ]),
    ).toEqual([]);
  });
});

describe("getVisibleCreateActions", () => {
  it("limits create items to their sections", () => {
    expect(keys(getVisibleCreateActions(config, "my-documents"))).toEqual([
      "everywhere",
      "mine",
    ]);
    expect(keys(getVisibleCreateActions(config, "rooms"))).toEqual(["everywhere"]);
  });
});

describe("getManagerSection", () => {
  it("names the Manager root folders", () => {
    expect(getManagerSection(FolderType.Rooms)).toBe("rooms");
    expect(getManagerSection(FolderType.USER)).toBe("my-documents");
    expect(getManagerSection(FolderType.Archive)).toBe("archive");
    expect(getManagerSection(undefined)).toBeUndefined();
  });
});

describe("sendCustomAction", () => {
  it("fires onCustomAction with the event payload", () => {
    sendCustomAction({ action: "any", type: "create", folderId: 4 });
    expect(frameCallEvent).toHaveBeenCalledWith({
      event: "onCustomAction",
      data: { action: "any", type: "create", folderId: 4 },
    });
  });
});

describe("getCustomActionIconProps", () => {
  it("keeps a missing icon as an empty string", () => {
    expect(getCustomActionIconProps(undefined)).toEqual({ icon: "" });
  });

  it("keeps a data url as the icon to inline", () => {
    const icon = "data:image/svg+xml;base64,PHN2Zy8+";

    expect(getCustomActionIconProps(icon)).toEqual({ icon });
  });

  it("adds an image node for an icon url", () => {
    const { icon, iconNode } = getCustomActionIconProps(
      "https://host.example/icons/star.svg",
    );

    expect(icon).toBe("https://host.example/icons/star.svg");
    expect(iconNode).toMatchObject({
      type: "img",
      props: {
        src: "https://host.example/icons/star.svg",
        alt: "",
        width: 16,
        height: 16,
      },
    });
  });
});
