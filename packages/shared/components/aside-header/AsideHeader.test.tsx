import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AsideHeader } from ".";
import styles from "./AsideHeader.module.scss";

describe("AsideHeader", () => {
  it("renders header text correctly", () => {
    const headerText = "Test Header";
    render(<AsideHeader header={headerText} />);
    expect(screen.getByTestId("text")).toHaveTextContent(headerText);
  });

  it("renders back button when isBackButton is true and handle click on it", () => {
    const onBackClick = jest.fn();
    const { container } = render(
      <AsideHeader isBackButton onBackClick={onBackClick} />,
    );

    const backButton = container.querySelector(`.${styles.arrowButton}`);
    expect(backButton).toBeInTheDocument();

    if (backButton) {
      fireEvent.click(backButton);
    }
    expect(onBackClick).toHaveBeenCalledTimes(1);
  });

  it("renders close button when isCloseable is true", () => {
    const onCloseClick = jest.fn();
    render(<AsideHeader isCloseable onCloseClick={onCloseClick} />);

    const closeButton = screen.getByTestId("aside_header_close_icon_button");
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
    expect(onCloseClick).toHaveBeenCalledTimes(1);
  });

  it("renders custom header icons", () => {
    const headerIcons = [
      {
        key: "settings",
        url: "/images/settings.react.svg",
        onClick: jest.fn(),
      },
      {
        key: "info",
        url: "/images/info.react.svg",
        onClick: jest.fn(),
      },
    ];

    render(<AsideHeader headerIcons={headerIcons} />);

    const iconsContainer = screen.getByTestId("icons-container");
    expect(iconsContainer).toBeInTheDocument();
    expect(iconsContainer.children).toHaveLength(2);
  });

  it("applies custom height when headerHeight is provided", () => {
    render(<AsideHeader headerHeight="70px" />);

    const header = screen.getByTestId("aside-header");
    expect(header).toHaveClass(styles.customHeaderHeight);
  });

  it("shows loading state when isLoading is true", () => {
    render(<AsideHeader isLoading />);

    const skeleton = screen.getByTestId("rectangle-skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("renders without border when withoutBorder is true", () => {
    const { container } = render(<AsideHeader withoutBorder />);

    const header = container.firstChild;
    expect(header).toHaveStyle({ borderBottom: "none" });
  });

  it("renders ReactNode as header content", () => {
    const CustomHeader = () => (
      <div data-testid="custom-header">Custom Header</div>
    );
    render(<AsideHeader header={<CustomHeader />} />);

    expect(screen.getByTestId("custom-header")).toBeInTheDocument();
  });
});
