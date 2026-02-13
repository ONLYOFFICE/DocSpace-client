import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import styles from "./Tiles.module.scss";

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
    const { getByTestId } = render(<TileSkeleton isFolder />);
    const folderTile = getByTestId("tile-skeleton-folder");
    expect(folderTile).toBeInTheDocument();
  });

  it("renders file tile", () => {
    const { getByTestId } = render(<TileSkeleton />);
    const fileTile = getByTestId("tile-skeleton-file");
    expect(fileTile).toHaveClass(styles.file);
  });

  it("renders room tile", () => {
    const { getByTestId } = render(<TileSkeleton isRoom />);
    const roomTile = getByTestId("room-tile-content");
    expect(roomTile).toBeInTheDocument();
  });
});
