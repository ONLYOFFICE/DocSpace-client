import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { TilesSkeleton } from "./Tiles";
import { TileSkeleton } from "./Tile";

describe("TilesSkeleton", () => {
  it("renders with default props", () => {
    const { container } = render(<TilesSkeleton />);
    const folders = container.querySelectorAll("[class*='tile']");
    expect(folders).toHaveLength(13); // 2 folders + 8 files by default
  });

  it("renders with custom counts", () => {
    const { container } = render(
      <TilesSkeleton foldersCount={3} filesCount={5} />,
    );
    const tiles = container.querySelectorAll("[class*='tile']");
    expect(tiles).toHaveLength(11); // 3 folders + 5 files
  });

  it("renders without title when withTitle is false", () => {
    const { container } = render(<TilesSkeleton withTitle={false} />);
    const wrapper = container.firstChild;
    expect(wrapper).not.toHaveClass("withTitle");
  });
});

describe("TileSkeleton", () => {
  it("renders folder tile", () => {
    const { container } = render(<TileSkeleton isFolder />);
    const bottom = container.querySelector("[class*='bottom']");
    expect(bottom).not.toHaveClass("file");
  });

  it("renders file tile", () => {
    const { container } = render(<TileSkeleton />);
    const bottom = container.querySelector("[class*='bottom']");
    expect(bottom).toHaveClass("file");
  });

  it("renders room tile", () => {
    const { container } = render(<TileSkeleton isRoom />);
    const roomTile = container.querySelector("[class*='roomTile']");
    expect(roomTile).toBeInTheDocument();
  });
});
