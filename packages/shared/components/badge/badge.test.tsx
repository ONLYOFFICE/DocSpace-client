// (c) Copyright Ascensio System SIA 2009-2024
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
import { screen, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import { Badge } from ".";

describe("<Badge />", () => {
  const renderComponent = (props = {}) => {
    return render(<Badge {...props} />);
  };

  describe("Rendering", () => {
    it("displays label correctly", () => {
      renderComponent({ label: "10" });
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("renders with default props", () => {
      renderComponent();
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("role", "status");
      expect(badge).toHaveAttribute("aria-atomic", "true");
      expect(badge).toHaveAttribute("aria-live", "polite");
    });

    it("applies base styles correctly", () => {
      renderComponent({ label: "10" });
      const badge = screen.getByTestId("badge");

      expect(badge).toHaveClass("badge");
      expect(badge).toHaveClass("themed");
      expect(badge).toHaveStyle({
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        flexShrink: "0",
      });
    });

    it("applies custom styles correctly", () => {
      const customProps = {
        fontSize: "14px",
        color: "red",
        backgroundColor: "blue",
        borderRadius: "5px",
        padding: "10px",
        maxWidth: "100px",
        height: "30px",
        border: "1px solid black",
        label: "10",
      };

      renderComponent(customProps);
      const badge = screen.getByTestId("badge");

      expect(badge).toHaveStyle({
        height: "30px",
        border: "1px solid black",
        borderRadius: "5px",
      });
    });
  });

  describe("Accessibility", () => {
    it("has correct ARIA attributes when non-interactive", () => {
      renderComponent({ label: "5" });
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("role", "status");
      expect(badge).toHaveAttribute("aria-label", "5 ");
      expect(badge).toHaveAttribute("aria-live", "polite");
      expect(badge).toHaveAttribute("aria-atomic", "true");
    });

    it("has correct ARIA attributes with type", () => {
      renderComponent({ label: "5", type: "notifications" });
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("aria-label", "5 notifications");
    });
  });

  describe("Interactions", () => {
    it("handles click events", async () => {
      const onClick = jest.fn();
      renderComponent({ label: "Click", onClick });

      const badge = screen.getByTestId("badge");
      await userEvent.click(badge);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Display Logic", () => {
    it("does not display when label is 0", () => {
      renderComponent({ label: "0" });
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveAttribute("data-hidden", "true");
    });

    it("displays when label is non-zero", () => {
      renderComponent({ label: "1" });
      const badge = screen.getByTestId("badge");
      expect(badge).not.toHaveAttribute("data-hidden");
    });

    it("applies high priority styling", () => {
      renderComponent({ label: "High", type: "high" });
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveStyle({
        border: "none",
        borderRadius: "6px",
      });
    });

    it("applies compact styling", () => {
      renderComponent({ label: "Compact", compact: true });
      const inner = screen.getByText("Compact").parentElement;
      expect(inner).toHaveAttribute("data-compact", "true");
      expect(inner).toHaveStyle({
        lineHeight: "var(--badge-line-height)",
      });
    });
  });
});
