import { describe, it, expect, vi } from "vitest";
import type { TFunction } from "i18next";

import { getAiModelsColumns } from "../aiModelsColumns";

// What is under test is which column each cell sits in, not the cells.
vi.mock("../AiModelsCells", () => ({
  ModelCell: () => null,
  PriceCell: () => null,
  ToggleCell: () => null,
  DetailsCell: () => null,
}));

const t = ((key: string) => key) as unknown as TFunction;

describe("AI models columns", () => {
  it("give a text model its input, output and cached input prices", () => {
    expect(
      getAiModelsColumns(t, "$", false, () => {}).map((column) => column.id),
    ).toEqual(["Model", "Input", "Output", "CachedInput", "OffOn", "Details"]);
  });

  it("give an image model its image input, image output and output prices", () => {
    expect(
      getAiModelsColumns(t, "$", true, () => {}).map((column) => column.id),
    ).toEqual([
      "Model",
      "ImageInput",
      "ImageOutput",
      "Output",
      "OffOn",
      "Details",
    ]);
  });

  it("lay both tables out alike, so that they line up", () => {
    const widths = (isImage: boolean) =>
      getAiModelsColumns(t, "$", isImage, () => {}).map(
        (column) => column.width,
      );

    expect(widths(true)).toEqual(widths(false));
    expect(widths(false)).toEqual([
      { type: "fill", min: 180 },
      { type: "flex", min: 90 },
      { type: "flex", min: 90 },
      { type: "flex", min: 90 },
      { type: "fixed", size: 76 },
      { type: "fixed", size: 120 },
    ]);
  });
});
