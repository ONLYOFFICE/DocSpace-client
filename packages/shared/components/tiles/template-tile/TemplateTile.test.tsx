import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { TemplateTile } from "./TemplateTile";
import { TemplateTileProps, SpaceQuotaProps } from "./TemplateTile.types";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock styles
jest.mock("./TemplateTile.module.scss", () => ({
  wrapper: "wrapper",
  field: "field",
  text: "text",
}));

// Mock Link component
jest.mock("@docspace/shared/components/link", () => ({
  Link: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" data-testid="link" onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock Text component
jest.mock("@docspace/shared/components/text", () => ({
  Text: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="text" className={className}>
      {children}
    </div>
  ),
}));

interface BaseTileProps {
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  className?: string;
}

// Mock BaseTile component
jest.mock("../base-tile/BaseTile", () => ({
  BaseTile: ({ topContent, bottomContent, className }: BaseTileProps) => (
    <div data-testid="base-tile" className={className}>
      <div data-testid="top-content">{topContent}</div>
      <div data-testid="bottom-content">{bottomContent}</div>
    </div>
  ),
}));

describe("TemplateTile", () => {
  const mockItem = {
    id: "1",
    title: "Test Template",
    createdBy: {
      displayName: "John Doe",
    },
    security: {
      EditRoom: true,
    },
  };

  const mockContextOptions = [
    { key: "edit", label: "Edit", onClick: jest.fn() },
    { key: "delete", label: "Delete", onClick: jest.fn() },
  ];

  const MockSpaceQuota: React.FC<SpaceQuotaProps> = ({ item, type }) => (
    <div data-testid="space-quota">
      Space Quota: {item.id}, Type: {type}
    </div>
  );

  const TemplateContent = () => (
    <div data-testid="template-content">{mockItem.title}</div>
  );

  const renderTemplateTile = (props: Partial<TemplateTileProps> = {}) => {
    const defaultProps: TemplateTileProps = {
      item: mockItem,
      children: <TemplateContent />,
      columnCount: 3,
      showStorageInfo: false,
      openUser: jest.fn(),
      contextOptions: mockContextOptions,
      onSelect: jest.fn(),
      checked: false,
      isActive: false,
      isBlockingOperation: false,
      inProgress: false,
      isEdit: false,
      showHotkeyBorder: false,
      SpaceQuotaComponent: MockSpaceQuota,
      ...props,
    };

    return render(<TemplateTile {...defaultProps} />);
  };

  it("renders template title correctly", () => {
    renderTemplateTile();
    expect(screen.getByTestId("template-content")).toBeTruthy();
    expect(screen.getByTestId("template-content").textContent).toBe(
      "Test Template",
    );
  });

  it("renders owner information", () => {
    renderTemplateTile();
    const ownerLabel = screen.getByText("Owner");
    const ownerName = screen.getByText("John Doe");

    expect(ownerLabel).toBeTruthy();
    expect(ownerName).toBeTruthy();
  });

  it("calls openUser when owner link is clicked", () => {
    const openUser = jest.fn();
    renderTemplateTile({ openUser });

    const ownerLink = screen.getByTestId("link");
    fireEvent.click(ownerLink);

    expect(openUser).toHaveBeenCalled();
  });

  it("shows storage information when showStorageInfo is true", () => {
    renderTemplateTile({ showStorageInfo: true });

    expect(screen.getByText("Storage")).toBeTruthy();
    expect(screen.getByTestId("space-quota")).toBeTruthy();
  });

  it("does not show storage information when showStorageInfo is false", () => {
    renderTemplateTile({ showStorageInfo: false });

    expect(screen.queryByText("Storage")).toBeNull();
    expect(screen.queryByTestId("space-quota")).toBeNull();
  });

  it("does not show space quota when SpaceQuotaComponent is not provided", () => {
    renderTemplateTile({
      showStorageInfo: true,
      SpaceQuotaComponent: undefined,
    });

    expect(screen.queryByTestId("space-quota")).toBeNull();
  });

  it("renders badges when provided", () => {
    const badges = <div data-testid="test-badge">Badge</div>;
    renderTemplateTile({ badges });
    expect(screen.getByTestId("test-badge")).toBeTruthy();
  });

  it("passes correct props to BaseTile", () => {
    renderTemplateTile();

    const baseTile = screen.getByTestId("base-tile");
    const topContent = screen.getByTestId("top-content");
    const bottomContent = screen.getByTestId("bottom-content");

    expect(baseTile).toBeTruthy();
    expect(topContent).toBeTruthy();
    expect(bottomContent).toBeTruthy();
  });

  it("adjusts layout based on columnCount", () => {
    const columnCount = 4;
    renderTemplateTile({ columnCount });

    // Here we could check for specific layout adjustments based on columnCount
    // This might involve checking specific class names or styles
    expect(screen.getByTestId("base-tile")).toBeTruthy();
  });
});
