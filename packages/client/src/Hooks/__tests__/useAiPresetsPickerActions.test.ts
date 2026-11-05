import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import type { TAiPreset } from "SRC_DIR/store/AiPresetsStore";

import {
  isAiPresetActionId,
  useAiPresetsPickerActions,
} from "../useAiPresetsPickerActions";

const preset = (id: string, name: string, profileId: string | null): TAiPreset => ({
  id,
  name,
  profileId,
  profileName: profileId ? `Model ${profileId}` : null,
  contextRooms: [],
  knowledgeRooms: [],
  createdAt: "2026-10-21T00:00:00.000Z",
});

describe("useAiPresetsPickerActions", () => {
  it("offers nothing while the user has no presets", () => {
    const { result } = renderHook(() => useAiPresetsPickerActions([], vi.fn()));
    expect(result.current).toEqual([]);
  });

  it("lists the presets under one submenu, with the model of each", () => {
    const onPick = vi.fn();
    const presets = [preset("a", "Daily", "p1"), preset("b", "No model", null)];
    const { result } = renderHook(() =>
      useAiPresetsPickerActions(presets, onPick),
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("choose-ai-preset");
    expect(result.current[0].text).toBe("Common:ChooseAIProject");
    const items = result.current[0].items ?? [];
    expect(items.map((item) => item.text)).toEqual(["Daily", "No model"]);
    expect(items[0].profileId).toBe("p1");
    expect(items[1].profileId).toBeUndefined();
    expect(isAiPresetActionId(items[0].id)).toBe(true);
    expect(isAiPresetActionId("choose-ai-agent")).toBe(false);

    items[1].onClick?.();
    expect(onPick).toHaveBeenCalledWith(presets[1]);
  });
});
