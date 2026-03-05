// (c) Copyright Ascensio System SIA 2009-2026
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
