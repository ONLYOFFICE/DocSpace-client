import React from "react";
import { screen, fireEvent } from "@testing-library/react";
import ShareFormDialog from "./ShareFormDialog";
import { ShareFormDialogProps } from "./ShareFormDialog.types";
import "@testing-library/jest-dom";
import { renderWithTheme } from "../../utils/render-with-theme";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("<ShareFormDialog />", () => {
  const baseProps: ShareFormDialogProps = {
    visible: true,
    onClose: jest.fn(),
    onClickFormRoom: jest.fn(),
    onClickVirtualDataRoom: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without error", () => {
    renderWithTheme(<ShareFormDialog {...baseProps} />);
    expect(screen.getByText("Common:ShareToFillOut")).toBeInTheDocument();
  });

  it("renders both room options", () => {
    renderWithTheme(<ShareFormDialog {...baseProps} />);
    expect(screen.getAllByText("Common:InFormFillingRoomTitle")).toHaveLength(
      2,
    );
    expect(
      screen.getAllByText("Common:InFormFillingRoomDescription"),
    ).toHaveLength(2);
  });

  it("renders share buttons for both rooms", () => {
    renderWithTheme(<ShareFormDialog {...baseProps} />);
    const shareButtons = screen.getAllByText("Common:ShareInTheRoom");
    expect(shareButtons).toHaveLength(2);
  });

  it("calls onClickFormRoom when form room button is clicked", () => {
    renderWithTheme(<ShareFormDialog {...baseProps} />);
    const shareButtons = screen.getAllByText("Common:ShareInTheRoom");
    fireEvent.click(shareButtons[0]);
    expect(baseProps.onClickFormRoom).toHaveBeenCalled();
  });

  it("calls onClickVirtualDataRoom when virtual data room button is clicked", () => {
    renderWithTheme(<ShareFormDialog {...baseProps} />);
    const shareButtons = screen.getAllByText("Common:ShareInTheRoom");
    fireEvent.click(shareButtons[1]);
    expect(baseProps.onClickVirtualDataRoom).toHaveBeenCalled();
  });
});
