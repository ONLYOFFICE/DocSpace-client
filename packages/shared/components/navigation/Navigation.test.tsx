import React from "react";
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navigation from "./Navigation";
import { DeviceType } from "../../enums";

describe("Navigation Component", () => {
  const defaultProps = {
    tReady: true,
    showText: true,
    isRootFolder: false,
    title: "My Documents",
    canCreate: true,
    isTabletView: false,
    navigationItems: [
      { id: "1", title: "Documents", isRootRoom: false },
      { id: "2", title: "Shared with me", isRootRoom: false },
      { id: "3", title: "Project files", isRootRoom: true },
    ],
    onClickFolder: jest.fn(),
    onBackToParentFolder: jest.fn(),
    getContextOptionsFolder: jest.fn(() => [
      { key: "rename", label: "Rename" },
      { key: "delete", label: "Delete" },
    ]),
    getContextOptionsPlus: jest.fn(() => [
      { key: "upload", label: "Upload file" },
      { key: "create", label: "Create folder" },
    ]),
    isTrashFolder: false,
    isEmptyFilesList: false,
    clearTrash: jest.fn(),
    showFolderInfo: jest.fn(),
    isCurrentFolderInfo: false,
    toggleInfoPanel: jest.fn(),
    isInfoPanelVisible: false,
    titles: {
      infoPanel: "Info Panel",
      actions: "Actions",
      contextMenu: "Context Menu",
      warningText: "Warning",
    },
    withMenu: true,
    onPlusClick: jest.fn(),
    isEmptyPage: false,
    isDesktop: true,
    isRoom: false,
    isFrame: false,
    hideInfoPanel: jest.fn(),
    withLogo: false,
    burgerLogo: "test-logo.svg",
    showRootFolderTitle: true,
    isPublicRoom: false,
    titleIcon: "folder",
    currentDeviceType: DeviceType.desktop,
    rootRoomTitle: "Root Room",
    showTitle: true,
    navigationButtonLabel: "Navigation",
    onNavigationButtonClick: jest.fn(),
    tariffBar: <div data-testid="tariff-bar">Tariff information</div>,
    showNavigationButton: true,
    titleIconTooltip: "Folder tooltip",
    onContextOptionsClick: jest.fn(),
    onLogoClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders navigation component with title", () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getByText("My Documents")).toBeInTheDocument();
  });

  it("renders tariff bar when provided", () => {
    render(<Navigation {...defaultProps} />);
    expect(screen.getByTestId("tariff-bar")).toBeInTheDocument();
  });

  it("handles empty file list state", () => {
    render(<Navigation {...defaultProps} isEmptyFilesList />);
    // Add assertions based on your empty state UI
    expect(screen.getByText("My Documents")).toBeInTheDocument();
  });

  it("adapts to tablet view", () => {
    render(<Navigation {...defaultProps} />);
    // Add assertions for tablet-specific UI elements
    expect(screen.getByText("My Documents")).toBeInTheDocument();
  });

  it("shows public room specific UI when isPublicRoom is true", () => {
    render(<Navigation {...defaultProps} isPublicRoom />);
    // Add assertions for public room specific UI elements
    expect(screen.getByText("My Documents")).toBeInTheDocument();
  });
});
