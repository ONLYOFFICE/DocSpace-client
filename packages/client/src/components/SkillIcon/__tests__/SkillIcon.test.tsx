import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RoomsType } from "@docspace/shared/enums";

import SkillIcon, {
  getAiRoomIconKind,
  isKnowledgeBaseIconRoom,
  isSkillSetIconRoom,
} from "../index";

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

  it("draws a knowledge base as a rounded square with the page at half of it", () => {
    render(<SkillIcon kind="knowledge" size={32} />);
    const icon = screen.getByTestId("skill-icon-knowledge");
    expect(icon.style.borderRadius).toBe("5px");
    expect(icon.querySelector("svg")?.getAttribute("width")).toBe("16");
  });

  it("gives the knowledge base icon to every knowledge base, and no other room", () => {
    const base = { isRoom: true, roomType: RoomsType.KnowledgeRoom };
    expect(isKnowledgeBaseIconRoom(base)).toBe(true);
    expect(isKnowledgeBaseIconRoom({ ...base, logo: { medium: "/logo.png" } } as never)).toBe(true);
    expect(isKnowledgeBaseIconRoom({ roomType: RoomsType.KnowledgeRoom })).toBe(false);
    expect(getAiRoomIconKind(base)).toBe("knowledge");
    expect(getAiRoomIconKind({ isRoom: true, roomType: RoomsType.InstructionsRoom })).toBe("set");
    expect(getAiRoomIconKind({ isRoom: true, roomType: RoomsType.AiProjectRoom })).toBeNull();
  });
});
