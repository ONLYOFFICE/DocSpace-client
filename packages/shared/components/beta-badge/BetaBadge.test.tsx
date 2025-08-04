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
import "@testing-library/jest-dom";
import { screen, fireEvent, waitFor } from "@testing-library/react";

import { renderWithTheme } from "../../utils/render-with-theme";

import { DeviceType } from "../../enums";

import { BetaBadge, BetaBadgeProps } from ".";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "Common:BetaLabel": "BETA",
        "Common:BetaBadgeTitle": "Beta Feature",
        "Common:BetaBadgeDescription": "This is a beta feature",
        "Common:ProductName": "DocSpace",
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
    renderWithTheme(<BetaBadge {...baseProps} />);

    expect(screen.getByText("BETA")).toBeInTheDocument();
  });

  it("renders tooltip with correct content when clicked", async () => {
    renderWithTheme(<BetaBadge {...baseProps} />);

    const badge = screen.getByText("BETA");
    fireEvent.click(badge);

    await waitFor(() => {
      expect(screen.getByText("Beta Feature")).toBeInTheDocument();
      expect(screen.getByText(/This is a beta feature/)).toBeInTheDocument();
    });
  });

  it("hides feedback links when withOutFeedbackLink is true", async () => {
    renderWithTheme(<BetaBadge {...baseProps} withOutFeedbackLink />);

    const badge = screen.getByText("BETA");
    fireEvent.click(badge);

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

    renderWithTheme(<BetaBadge {...mobileProps} />);

    const badge = screen.getByText("BETA");
    fireEvent.click(badge);

    await waitFor(() => {
      const tooltip = screen.getByTestId("tooltip");
      expect(tooltip.querySelector("[role='tooltip']")).toHaveClass(
        "react-tooltip__place-bottom-end",
      );
    });
  });

  it("closes tooltip when close button is clicked", async () => {
    renderWithTheme(<BetaBadge {...baseProps} />);

    const badge = screen.getByText("BETA");
    fireEvent.click(badge);

    await waitFor(() => {
      expect(screen.getByText("Beta Feature")).toBeInTheDocument();
    });

    const closeButton = screen.getByTestId("icon-button");
    fireEvent.click(closeButton);

    await waitFor(
      () => {
        expect(screen.queryByText("Beta Feature")).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });
});
