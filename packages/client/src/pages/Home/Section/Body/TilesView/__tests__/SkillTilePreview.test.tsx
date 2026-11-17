import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const skillsStore = vi.hoisted(() => ({ get: vi.fn(), fetch: vi.fn() }));

vi.mock("SRC_DIR/store/useStore", () => ({ useStore: () => skillsStore }));

import SkillTilePreview from "../SkillTilePreview";

const file = { id: 5, title: "Check Clauses.md", version: 2, viewUrl: "/view/5" };

describe("SkillTilePreview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    skillsStore.get.mockReturnValue(null);
  });

  it("reads the skill and shows the command its title makes until it lands", () => {
    render(<SkillTilePreview file={file} />);
    expect(skillsStore.fetch).toHaveBeenCalledWith({ id: 5, version: 2, viewUrl: "/view/5" });
    expect(screen.getByTestId("skill-tile-command").textContent).toBe("/check-clauses");
    expect(screen.queryByTestId("skill-tile-description")).toBeNull();
  });

  it("shows the command of the skill's own name and its description", () => {
    skillsStore.get.mockReturnValue({
      name: "clause-check",
      description: "Finds risky clauses",
      body: "",
    });
    render(<SkillTilePreview file={file} />);
    expect(skillsStore.fetch).not.toHaveBeenCalled();
    expect(screen.getByTestId("skill-tile-command").textContent).toBe("/clause-check");
    expect(screen.getByTestId("skill-tile-description").textContent).toBe("Finds risky clauses");
  });
});
