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

import { fireEvent, screen, render } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  mockBuildInfo,
  mockCompanyInfo,
  mockDefaultProps,
  mockPreviewCompanyInfo,
} from "./mockData";
import { AboutDialog } from "./index";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (i18nKey: string) => i18nKey,
    ready: true,
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}));

describe("AboutDialog", () => {
  let testProps: typeof mockDefaultProps;

  beforeEach(() => {
    vi.clearAllMocks();
    testProps = {
      ...mockDefaultProps,
      onClose: vi.fn(),
    };
  });

  it("renders without errors", () => {
    render(<AboutDialog {...testProps} />);
    expect(screen.getByText("AboutHeader")).toBeInTheDocument();
  });

  it("calls onClose callback when dialog is closed", () => {
    render(<AboutDialog {...testProps} />);
    const closeButton = screen.getByLabelText("close");
    fireEvent.click(closeButton);
    expect(testProps.onClose).toHaveBeenCalled();
  });

  it("displays correct version information", () => {
    render(<AboutDialog {...testProps} />);
    expect(screen.getByText(mockBuildInfo.documentServer)).toBeInTheDocument();
    expect(screen.getByText(mockBuildInfo.docSpace)).toBeInTheDocument();
  });

  it("displays company information", () => {
    render(<AboutDialog {...testProps} />);
    expect(screen.getByText(mockCompanyInfo.email)).toBeInTheDocument();
    expect(screen.getByText(mockCompanyInfo.phone)).toBeInTheDocument();
    expect(screen.getByText(mockCompanyInfo.address)).toBeInTheDocument();
  });

  it("renders in standalone mode", () => {
    const standaloneProps = {
      ...testProps,
      standalone: true,
      isEnterprise: false,
    };

    render(<AboutDialog {...standaloneProps} />);
    expect(screen.getByText("AGPL-3.0")).toBeInTheDocument();
  });

  it("renders with preview data when provided", () => {
    const previewProps = {
      ...testProps,
      previewData: mockPreviewCompanyInfo,
    };

    render(<AboutDialog {...previewProps} />);
    expect(screen.getByText("preview@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("456 Preview Ave, Preview City, USA"),
    ).toBeInTheDocument();
  });
});
