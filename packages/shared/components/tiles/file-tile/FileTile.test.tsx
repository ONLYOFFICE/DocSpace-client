import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { FileTile } from "./FileTile";
import { FileItemType } from "./FileTile.types";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock ReactSVG component
jest.mock("react-svg", () => ({
  ReactSVG: () => <div data-testid="mock-svg" />,
}));

// Mock styles
jest.mock("./FileTile.module.scss", () => ({
  fileTile: "fileTile",
  isBlockingOperation: "isBlockingOperation",
  showHotkeyBorder: "showHotkeyBorder",
  highlight: "highlight",
  loader: "loader",
  icons: "icons",
  iconContainer: "iconContainer",
}));

// Mock Checkbox component
jest.mock("@docspace/shared/components/checkbox", () => ({
  Checkbox: ({
    isChecked,
    onChange,
  }: {
    isChecked?: boolean;
    onChange?: (e: { target: { checked: boolean } }) => void;
  }) => (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={() => onChange?.({ target: { checked: !isChecked } })}
      data-testid="checkbox"
    />
  ),
}));

describe("FileTile", () => {
  const mockItem: FileItemType = {
    id: "1",
    title: "Test File",
    fileExst: ".docx",
    fileType: "docx",
  };

  const mockContextOptions = [
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete" },
  ];

  const defaultProps = {
    item: mockItem,
    contextOptions: mockContextOptions,
    element: <div data-testid="file-icon">File Icon</div>,
  };

  const FileContent = () => (
    <div data-testid="file-content" className="item-file-name">
      {mockItem.title}
    </div>
  );

  it("renders file title correctly", () => {
    render(
      <FileTile {...defaultProps}>
        <FileContent />
      </FileTile>,
    );
    expect(screen.getByTestId("file-content")).toBeTruthy();
    expect(screen.getByTestId("file-content").textContent).toBe("Test File");
  });

  it("shows checkbox when checked prop is provided", () => {
    render(
      <FileTile {...defaultProps} checked>
        <FileContent />
      </FileTile>,
    );

    const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
  });

  it("calls onSelect when checkbox is clicked", () => {
    const onSelect = jest.fn();
    render(
      <FileTile {...defaultProps} onSelect={onSelect}>
        <FileContent />
      </FileTile>,
    );

    const checkbox = screen.getByTestId("checkbox");
    fireEvent.click(checkbox);

    expect(onSelect).toHaveBeenCalledWith(true, mockItem);
  });

  it("shows loader when inProgress is true", () => {
    render(
      <FileTile {...defaultProps} inProgress>
        <FileContent />
      </FileTile>,
    );
    const loader = screen.getByTestId("loader");
    expect(loader).toBeTruthy();
  });

  it("calls thumbnailClick when thumbnail is clicked", () => {
    const thumbnailClick = jest.fn();
    render(
      <FileTile
        {...defaultProps}
        thumbnailClick={thumbnailClick}
        thumbnail="test.png"
      >
        <FileContent />
      </FileTile>,
    );

    const thumbnail = screen.getByTestId("file-thumbnail");
    fireEvent.click(thumbnail);

    expect(thumbnailClick).toHaveBeenCalled();
  });

  it("renders badges when provided", () => {
    const badges = <div data-testid="test-badge">Badge</div>;
    render(
      <FileTile {...defaultProps} badges={badges}>
        <FileContent />
      </FileTile>,
    );
    expect(screen.getByTestId("test-badge")).toBeTruthy();
  });

  it("shows hotkey border when showHotkeyBorder is true", () => {
    const { container } = render(
      <FileTile {...defaultProps} showHotkeyBorder>
        <FileContent />
      </FileTile>,
    );
    const element = container.querySelector("[class*='showHotkeyBorder']");
    expect(element).toBeTruthy();
  });
});
