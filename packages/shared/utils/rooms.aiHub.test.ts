// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { RoomsType } from "../enums";
import { withoutSettingsRefusedForAiRooms } from "./rooms";

const body = {
  title: "Room",
  roomType: RoomsType.InstructionsRoom,
  private: false,
  quota: 100,
  indexing: true,
  denyDownload: true,
  lifetime: { enabled: false },
  watermark: { enabled: false },
  saveFormAsXLSX: true,
  sendFormToExternalDB: false,
};

describe("withoutSettingsRefusedForAiRooms", () => {
  it("drops the settings an Instructions or Knowledge room refuses and keeps its quota", () => {
    for (const roomType of [RoomsType.InstructionsRoom, RoomsType.KnowledgeRoom]) {
      expect(withoutSettingsRefusedForAiRooms(body, roomType)).toEqual({
        title: "Room",
        roomType: RoomsType.InstructionsRoom,
        private: false,
        quota: 100,
      });
    }
  });

  it("drops the quota of an AI project as well", () => {
    expect(withoutSettingsRefusedForAiRooms(body, RoomsType.AiProjectRoom)).not.toHaveProperty("quota");
  });

  it("leaves any other room type as it is", () => {
    expect(withoutSettingsRefusedForAiRooms(body, RoomsType.FormRoom)).toBe(body);
    expect(withoutSettingsRefusedForAiRooms(body, undefined)).toBe(body);
  });
});
