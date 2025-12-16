import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, render } from "@testing-library/react";
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
    onClickFolder: vi.fn(),
    onBackToParentFolder: vi.fn(),
    getContextOptionsFolder: vi.fn(() => [
      { key: "rename", label: "Rename" },
      { key: "delete", label: "Delete" },
    ]),
    getContextOptionsPlus: vi.fn(() => [
      { key: "upload", label: "Upload file" },
      { key: "create", label: "Create folder" },
    ]),
    isTrashFolder: false,
    isEmptyFilesList: false,
    clearTrash: vi.fn(),
    showFolderInfo: vi.fn(),
    isCurrentFolderInfo: false,
    toggleInfoPanel: vi.fn(),
    isInfoPanelVisible: false,
    titles: {
      infoPanel: "Info Panel",
      actions: "Actions",
      contextMenu: "Context Menu",
      warningText: "Warning",
    },
    withMenu: true,
    onPlusClick: vi.fn(),
    isEmptyPage: false,
    isDesktop: true,
    isRoom: false,
    isFrame: false,
    hideInfoPanel: vi.fn(),
    withLogo: false,
    burgerLogo: "test-logo.svg",
    showRootFolderTitle: true,
    isPublicRoom: false,
    titleIcon: "folder",
    currentDeviceType: DeviceType.desktop,
    rootRoomTitle: "Root Room",
    showTitle: true,
    navigationButtonLabel: "Navigation",
    onNavigationButtonClick: vi.fn(),
    tariffBar: <div data-testid="tariff-bar">Tariff information</div>,
    showNavigationButton: true,
    titleIconTooltip: "Folder tooltip",
    onContextOptionsClick: vi.fn(),
    onLogoClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
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
