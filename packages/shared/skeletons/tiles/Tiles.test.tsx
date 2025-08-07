import React from "react";
import { render, screen } from "@testing-library/react";
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
    render(<TileSkeleton isFolder />);
    const element = screen.getByTestId("folder-tile-skeleton");
    expect(element).toBeInTheDocument();
  });

  it("renders file tile", () => {
    render(<TileSkeleton />);
    const element = screen.getByTestId("file-tile-skeleton");
    expect(element).toBeInTheDocument();
  });

  it("renders room tile", () => {
    render(<TileSkeleton isRoom />);
    const element = screen.getByTestId("room-tile-skeleton");
    expect(element).toBeInTheDocument();
  });
});
