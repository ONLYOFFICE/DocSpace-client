/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";

import { InfoBar } from ".";

describe("<InfoBar />", () => {
  const renderComponent = (props = {}) => {
    return render(<InfoBar {...props} />);
  };

  describe("Rendering", () => {
    it("renders InfoBar component", () => {
      renderComponent();
      const infoBarElement = screen.getByTestId("info-bar");
      expect(infoBarElement).toBeInTheDocument();
    });

    it("renders with title", () => {
      renderComponent({ title: "Test Title" });
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });

    it("renders with description", () => {
      renderComponent({ description: "Test Description" });
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("renders with both title and description", () => {
      renderComponent({
        title: "Test Title",
        description: "Test Description",
      });
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    it("renders without title when not provided", () => {
      renderComponent({ description: "Only description" });
      expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
    });

    it("renders without description when not provided", () => {
      renderComponent({ title: "Only title" });
      const infoBar = screen.getByTestId("info-bar");
      expect(infoBar).toBeInTheDocument();
    });

    it("renders with custom dataTestId", () => {
      renderComponent({ dataTestId: "custom-test-id" });
      expect(screen.getByTestId("custom-test-id")).toBeInTheDocument();
    });

    it("renders with default dataTestId when not provided", () => {
      renderComponent();
      expect(screen.getByTestId("info-bar")).toBeInTheDocument();
    });
  });

  describe("Children", () => {
    it("renders children when provided", () => {
      renderComponent({
        title: "Title",
        children: <div data-testid="custom-child">Custom Content</div>,
      });
      expect(screen.getByTestId("custom-child")).toBeInTheDocument();
      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });

    it("renders without children when not provided", () => {
      renderComponent({ title: "Title" });
      expect(screen.queryByTestId("custom-child")).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      const customClass = "custom-info-bar";
      renderComponent({ className: customClass });
      const infoBarElement = screen.getByTestId("info-bar");
      expect(infoBarElement.className).toContain(customClass);
    });

    it("renders with default styles", () => {
      renderComponent({ title: "Test" });
      const infoBarElement = screen.getByTestId("info-bar");
      expect(infoBarElement).toBeInTheDocument();
    });
  });

  describe("Icon", () => {
    it("renders with default icon", () => {
      renderComponent({ title: "Test" });
      const infoBar = screen.getByTestId("info-bar");
      expect(infoBar).toBeInTheDocument();
    });

    it("renders with custom icon", () => {
      const customIcon = "/custom-icon.svg";
      renderComponent({ title: "Test", icon: customIcon });
      const infoBar = screen.getByTestId("info-bar");
      expect(infoBar).toBeInTheDocument();
    });
  });

  describe("Content Types", () => {
    it("renders ReactNode as title", () => {
      renderComponent({
        title: <span data-testid="custom-title">Custom Title Node</span>,
      });
      expect(screen.getByTestId("custom-title")).toBeInTheDocument();
    });

    it("renders ReactNode as description", () => {
      renderComponent({
        description: (
          <div data-testid="custom-description">Custom Description Node</div>
        ),
      });
      expect(screen.getByTestId("custom-description")).toBeInTheDocument();
    });

    it("renders string as title", () => {
      renderComponent({ title: "String Title" });
      expect(screen.getByText("String Title")).toBeInTheDocument();
    });

    it("renders string as description", () => {
      renderComponent({ description: "String Description" });
      expect(screen.getByText("String Description")).toBeInTheDocument();
    });
  });
});
