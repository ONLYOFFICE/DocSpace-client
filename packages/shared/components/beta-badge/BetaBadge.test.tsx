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
import { userEvent } from "@testing-library/user-event";

import { DeviceType } from "../../enums";

import { BetaBadge, BetaBadgeProps } from ".";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "Common:BetaBadgeTitle": "Beta Feature",
        "Common:BetaBadgeDescription": "This is a beta feature",
      };
      return translations[key] || key;
    },
  }),
  Trans: ({ children }: { children: string }) => children,
}));

const baseProps: BetaBadgeProps = {
  documentationEmail: "support@example.com",
  currentDeviceType: DeviceType.desktop,
  forumLinkUrl: "https://forum.example.com",
  place: "top-end",
  currentColorScheme: {
    id: 1,
    main: {
      accent: "#4781d1",
      buttons: "#4781d1",
    },
    name: "Base",
    text: {
      accent: "#4781d1",
      buttons: "#4781d1",
    },
  },
};

describe("<BetaBadge />", () => {
  it("renders without error", () => {
    render(<BetaBadge {...baseProps} />);

    expect(screen.getByText("BETA")).toBeInTheDocument();
  });

  it("renders tooltip with correct content when clicked", async () => {
    render(<BetaBadge {...baseProps} />);

    const badge = screen.getByText("BETA");
    await userEvent.click(badge);

    await waitFor(() => {
      expect(screen.getByText("Beta Feature")).toBeInTheDocument();
      expect(screen.getByText(/This is a beta feature/)).toBeInTheDocument();
    });
  });

  it("hides feedback links when withOutFeedbackLink is true", async () => {
    render(<BetaBadge {...baseProps} withOutFeedbackLink />);

    const badge = screen.getByText("BETA");
    await userEvent.click(badge);

    await waitFor(() => {
      expect(screen.queryByText(/form/)).not.toBeInTheDocument();
      expect(
        screen.queryByText(baseProps.documentationEmail || ""),
      ).not.toBeInTheDocument();
    });
  });

  it("uses mobile offset and placement for mobile device type", async () => {
    const mobileProps = {
      ...baseProps,
      currentDeviceType: DeviceType.mobile,
      mobilePlace: "bottom-end" as const,
    };

    render(<BetaBadge {...mobileProps} />);

    const badge = screen.getByText("BETA");
    await userEvent.click(badge);

    await waitFor(() => {
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip.querySelector("[role='tooltip']")).toHaveClass(
        "react-tooltip__place-bottom-end",
      );
    });
  });

  it("closes tooltip when close button is clicked", async () => {
    render(<BetaBadge {...baseProps} />);

    const badge = screen.getByText("BETA");
    await userEvent.click(badge);

    await waitFor(() => {
      expect(screen.getByText("Beta Feature")).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId("close-tooltip-button");
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Beta Feature")).not.toBeInTheDocument();
    });
  });
});
