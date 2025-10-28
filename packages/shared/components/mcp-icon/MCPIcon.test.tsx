// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MCPIcon } from "./MCPIcon";
import styles from "./MCPIcon.module.scss";

describe("<MCPIcon />", () => {
  const renderComponent = (props = {}) => {
    return render(<MCPIcon title="Test" {...props} />);
  };

  test("renders MCPIcon component without errors", () => {
    renderComponent();
    const iconElement = screen.getByTestId("mcp-icon");
    expect(iconElement).toBeInTheDocument();
  });

  test("renders with default size", () => {
    renderComponent();
    const iconElement = screen.getByTestId("mcp-icon");
    expect(iconElement.classList.contains(styles.medium)).toBeTruthy();
  });

  test("renders with custom className", () => {
    const customClass = "custom-icon";
    renderComponent({ className: customClass });
    const iconElement = screen.getByTestId("mcp-icon");
    expect(iconElement.className).toContain(customClass);
  });

  test("renders with custom dataTestId", () => {
    renderComponent({ dataTestId: "custom-test-id" });
    const iconElement = screen.getByTestId("custom-test-id");
    expect(iconElement).toBeInTheDocument();
  });

  test("displays first character of title in uppercase", () => {
    renderComponent({ title: "hugging face" });
    expect(screen.getByText("H")).toBeInTheDocument();
  });

  test("renders image when imgSrc is provided", () => {
    renderComponent({
      title: "Test",
      imgSrc: "https://example.com/icon.svg",
    });
    const imgElement = screen.getByRole("img");
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute("src", "https://example.com/icon.svg");
  });

  test("falls back to title when image fails to load", async () => {
    renderComponent({ title: "Fallback", imgSrc: "invalid-url.jpg" });

    const imgElement = screen.getByRole("img");

    act(() => {
      imgElement.dispatchEvent(new Event("error"));
    });

    await waitFor(() => {
      expect(screen.getByText("F")).toBeInTheDocument();
    });
  });

  test("resets error state when imgSrc changes", async () => {
    const { rerender } = renderComponent({
      title: "Test",
      imgSrc: "invalid-url.jpg",
    });

    const imgElement = screen.getByRole("img");

    act(() => {
      imgElement.dispatchEvent(new Event("error"));
    });

    await waitFor(() => {
      expect(screen.getByText("T")).toBeInTheDocument();
    });

    rerender(
      <MCPIcon title="Test" imgSrc="https://example.com/new-icon.svg" />,
    );

    await waitFor(() => {
      const newImgElement = screen.getByRole("img");
      expect(newImgElement).toHaveAttribute(
        "src",
        "https://example.com/new-icon.svg",
      );
    });
  });
});
