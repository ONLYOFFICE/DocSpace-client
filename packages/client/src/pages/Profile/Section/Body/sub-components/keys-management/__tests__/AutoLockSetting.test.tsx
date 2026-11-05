// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AutoLockSetting } from "../AutoLockSetting";

const selector = () =>
  within(screen.getByRole("group", { name: "Common:AutoLockLabel" })).getByRole(
    "button",
  );

describe("AutoLockSetting", () => {
  it("Auto-lock selector", () => {
    render(<AutoLockSetting />);

    expect(selector()).toHaveTextContent("Common:AutoLockOff");
  });

  // Spec: private-rooms/key-management, "The auto-lock list does not announce its highlight"
  it("Moving through the open list", async () => {
    const user = userEvent.setup();
    render(<AutoLockSetting />);

    selector().focus();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(selector()).toHaveTextContent("Common:AutoLock5m");
    expect(selector()).toHaveFocus();
  });
});
