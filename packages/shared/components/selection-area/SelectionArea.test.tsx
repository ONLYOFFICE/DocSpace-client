import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { TViewAs } from "../../types";

import { SelectionArea } from ".";

const mockOnMove = jest.fn();

const defaultProps = {
  containerClass: "container-class",
  selectableClass: "selectable-class",
  scrollClass: "scroll-class",
  viewAs: "tile" as TViewAs,
  itemsContainerClass: "items-container",
  isRooms: false,
  folderHeaderHeight: 40,
  countTilesInRow: 4,
  defaultHeaderHeight: 48,
  arrayTypes: [
    {
      type: "folders",
      rowGap: 16,
      itemHeight: 40,
      countOfMissingTiles: 0,
      rowCount: 2,
    },
    {
      type: "files",
      rowGap: 16,
      itemHeight: 40,
      countOfMissingTiles: 0,
      rowCount: 2,
    },
  ],
  itemClass: "item-class",
  onMove: mockOnMove,
};

const renderComponent = (props = {}) => {
  return render(<SelectionArea {...defaultProps} {...props} />);
};

describe("SelectionArea", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderComponent();
    expect(screen.getByTestId("selection-area")).toBeInTheDocument();
  });
});
