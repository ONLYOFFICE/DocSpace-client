import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import type { TActiveSession } from "SRC_DIR/store/SettingsSetupStore";

import { getSessionsColumns } from "../sessionsColumns";

// What is under test is which column each cell sits in, not the cells.
vi.mock("../SessionsCells", () => ({
  SessionCell: () => null,
  DateCell: () => null,
  LocationCell: () => null,
  RemoveCell: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;

const session = (id: number) =>
  ({ id, platform: "Windows", browser: "Chrome" }) as TActiveSession;

const context = { index: 0, isLast: false, compact: false };

const columns = (currentSessionId?: number) =>
  getSessionsColumns(t, { locale: "en", currentSessionId, onRemove: vi.fn() });

describe("sessions columns", () => {
  it("are the old header's columns, then the remove button", () => {
    expect(columns(1).map((column) => [column.id, column.title])).toEqual([
      ["Sessions", "Common:Sessions"],
      ["Date", "Common:Date"],
      ["Location", "Common:Location"],
      ["Remove", ""],
    ]);
  });

  it("keep the old minimum of the sessions column", () => {
    expect(columns(1).map((column) => column.width)).toEqual([
      { type: "fill", min: 180 },
      { type: "flex" },
      { type: "flex" },
      { type: "fixed", size: 24 },
    ]);
  });

  it("offer no remove button on the current session", () => {
    const remove = columns(1).find((column) => column.id === "Remove")!;

    expect(remove.cell(session(1), context)).toBeNull();
    expect(remove.cell(session(2), context)).not.toBeNull();
  });

  it("offer it on every session while the current one is unknown", () => {
    const remove = columns().find((column) => column.id === "Remove")!;

    expect(remove.cell(session(1), context)).not.toBeNull();
  });
});
