import React, { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DeviceType } from "@docspace/shared/enums";
import { ButtonSize } from "@docspace/shared/components/button";

import { RoomsModule } from "./index";

jest.mock("@docspace/shared/components/files-selector-input", () => ({
  FilesSelectorInput: ({
    onSelectFolder,
    isDisabled,
    id,
  }: {
    onSelectFolder: (id: string) => void;
    isDisabled: boolean;
    id?: string;
  }) => (
    <div data-testid="files-selector-input">
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => onSelectFolder("folder-id")}
        data-testid="select-folder-button"
      >
        Select Folder
      </button>
      <span>{id || "No ID"}</span>
    </div>
  ),
}));

jest.mock("@docspace/shared/dialogs/backup-to-public-room-dialog", () => ({
  __esModule: true,
  default: ({ visible }: { visible: boolean }) => (
    <div data-testid="backup-to-public-room-dialog">
      {visible ? "Dialog Visible" : "Dialog Hidden"}
    </div>
  ),
}));

jest.mock("@docspace/shared/components/toast", () => ({
  toastr: {
    error: jest.fn(),
  },
}));

const defaultProps = {
  onMakeCopy: jest.fn().mockResolvedValue(undefined),
  buttonSize: ButtonSize.normal,
  isMaxProgress: true,
  basePath: "/base/path",
  isErrorPath: false,
  newPath: "/new/path",
  maxWidth: "500px",
  setBasePath: jest.fn(),
  setNewPath: jest.fn(),
  toDefault: jest.fn(),
  currentDeviceType: DeviceType.desktop,
  settingsFileSelector: {
    getIcon: jest.fn(),
  },
};

describe("RoomsModule", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without errors", () => {
    render(<RoomsModule {...defaultProps} />);
    expect(screen.getByTestId("rooms-module")).toBeInTheDocument();
    expect(screen.getByTestId("files-selector-input")).toBeInTheDocument();
    expect(screen.getByText("Common:CreateCopy")).toBeInTheDocument();
  });

  it("calls onMakeCopy when create copy button is clicked", async () => {
    render(<RoomsModule {...defaultProps} />);

    fireEvent.click(screen.getByTestId("select-folder-button"));

    await act(async () => {
      fireEvent.click(screen.getByText("Common:CreateCopy"));
    });

    expect(defaultProps.onMakeCopy).toHaveBeenCalledWith(
      "folder-id",
      "Documents",
      "0",
    );
  });

  it("disables create copy button when isMaxProgress is false", () => {
    render(<RoomsModule {...defaultProps} isMaxProgress={false} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("disables create copy button when no folder is selected", () => {
    render(<RoomsModule {...defaultProps} />);
    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();
  });

  it("updates selectedFolder when onSelectFolder is called", async () => {
    render(<RoomsModule {...defaultProps} />);

    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).toBeDisabled();

    fireEvent.click(screen.getByTestId("select-folder-button"));

    expect(
      screen.getByText("Common:CreateCopy").closest("button"),
    ).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(screen.getByText("Common:CreateCopy"));
    });

    expect(defaultProps.onMakeCopy).toHaveBeenCalledWith(
      "folder-id",
      "Documents",
      "0",
    );
  });

  it("sets isStartCopy state during copy process", async () => {
    render(<RoomsModule {...defaultProps} />);

    fireEvent.click(screen.getByTestId("select-folder-button"));

    await act(async () => {
      fireEvent.click(screen.getByText("Common:CreateCopy"));
    });

    expect(defaultProps.onMakeCopy).toHaveBeenCalled();
  });

  it("handles errors during copy process", async () => {
    const error = new Error("Test error");
    const mockOnMakeCopy = jest.fn().mockRejectedValue(error);
    const toastrError = jest.requireMock("../../../../../components/toast")
      .toastr.error;
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<RoomsModule {...defaultProps} onMakeCopy={mockOnMakeCopy} />);

    fireEvent.click(screen.getByTestId("select-folder-button"));

    await act(async () => {
      fireEvent.click(screen.getByText("Common:CreateCopy"));
    });

    expect(toastrError).toHaveBeenCalledWith(error);

    consoleErrorSpy.mockRestore();
  });

  it("passes correct props to FilesSelectorInput", () => {
    render(<RoomsModule {...defaultProps} />);

    const filesSelectorInput = screen.getByTestId("files-selector-input");
    expect(filesSelectorInput).toBeInTheDocument();

    expect(screen.getByText("No ID")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("select-folder-button"));
    expect(screen.getByText("folder-id")).toBeInTheDocument();
  });
});
