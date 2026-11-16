import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RoomsType } from "@docspace/shared/enums";

import SkillIcon, { isSkillSetIconRoom } from "../index";

describe("SkillIcon", () => {
  it("draws a skill set as a rounded square of the asked size with the book at half of it", () => {
    render(<SkillIcon kind="set" size={96} />);
    const icon = screen.getByTestId("skill-icon-set");
    expect(icon.style.width).toBe("96px");
    expect(icon.style.borderRadius).toBe("16px");
    expect(icon.querySelector("svg")?.getAttribute("width")).toBe("48");
  });

  it("draws a skill without a square behind it", () => {
    render(<SkillIcon kind="skill" />);
    const icon = screen.getByTestId("skill-icon-skill");
    expect(icon.style.borderRadius).toBe("");
    expect(icon.querySelector("svg")?.getAttribute("width")).toBe("16");
  });

  it("gives the icon to every skill set, whatever logo is stored for it", () => {
    const set = { isRoom: true, roomType: RoomsType.InstructionsRoom };
    expect(isSkillSetIconRoom(set)).toBe(true);
    expect(isSkillSetIconRoom({ ...set, logo: { medium: "/logo.png" } } as never)).toBe(true);
    expect(isSkillSetIconRoom({ ...set, roomType: RoomsType.CustomRoom })).toBe(false);
    expect(isSkillSetIconRoom({ roomType: RoomsType.InstructionsRoom })).toBe(false);
  });
});
