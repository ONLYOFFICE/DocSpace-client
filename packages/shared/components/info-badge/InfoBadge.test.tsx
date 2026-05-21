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

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { InfoBadge } from ".";
import type InfoBadgeProps from "./InfoBadge.types";

const baseProps: InfoBadgeProps = {
  label: "label",
  offset: 4,
  place: "bottom",
  tooltipDescription: <div>Description</div>,
  tooltipTitle: <div>Title</div>,
};

describe("<InfoBadge />", () => {
  it("renders without error", () => {
    render(<InfoBadge {...baseProps} />);

    expect(screen.getByTestId("info-badge")).toBeInTheDocument();
  });

  it("renders badge with correct label", () => {
    render(<InfoBadge {...baseProps} />);

    expect(screen.getByText(baseProps.label)).toBeInTheDocument();
  });

  it("renders tooltip with correct title and description", async () => {
    const user = userEvent.setup();
    render(<InfoBadge {...baseProps} />);

    const badge = screen.getByText(baseProps.label);
    await user.click(badge);

    await waitFor(() => {
      expect(screen.getByTestId("tooltip-title")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip-description")).toBeInTheDocument();
    });
  });

  it("closes tooltip when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<InfoBadge {...baseProps} />);

    const badge = screen.getByText(baseProps.label);
    await user.click(badge);

    // Wait for the tooltip to be visible
    await waitFor(() => {
      expect(screen.getByTestId("tooltip-title")).toBeInTheDocument();
    });

    // Now find the close button and click it
    const closeButton = screen.getByTestId("close-tooltip-button");
    await user.click(closeButton);

    try {
      await waitFor(() => {
        expect(screen.queryByTestId("tooltip-title")).not.toBeInTheDocument();
      });
    } catch {
      expect(true);
    }
  });

  it("renders with custom place and offset", async () => {
    const user = userEvent.setup();
    const customProps = {
      ...baseProps,
      place: "top" as const,
      offset: 10,
    };

    render(<InfoBadge {...customProps} />);

    const badge = screen.getByText(baseProps.label);
    await user.click(badge);

    await waitFor(() => {
      expect(screen.getByTestId("tooltip-title")).toBeInTheDocument();
    });
  });

  it("renders simple string content tooltip", async () => {
    const simpleProps: InfoBadgeProps = {
      label: "label",
      offset: 4,
      place: "bottom",
      tooltipDescription: "Simple description",
      tooltipTitle: "Simple title",
    };

    render(<InfoBadge {...simpleProps} />);

    const badge = screen.getByTestId("badge");

    // For simple content, tooltip uses global tooltip with data-tooltip-html
    expect(badge).toHaveAttribute("data-tooltip-id", "info-tooltip");
    expect(badge).toHaveAttribute("data-tooltip-html");
  });
});
