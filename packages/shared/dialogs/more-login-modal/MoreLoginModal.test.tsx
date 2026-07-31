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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MoreLoginModal from "./index";
import { MoreLoginModalProps } from "./MoreLoginModal.types";
import { getBrandName } from "@docspace/shared/constants/brands";

describe("<MoreLoginModal />", () => {
  const baseProps: MoreLoginModalProps = {
    visible: true,
    onClose: vi.fn(),
    onSocialLoginClick: vi.fn(),
    ssoLabel: "SSO Login",
    ssoUrl: "https://example.com/sso",
    t: vi.fn((key: string) => key),
    providers: [
      { linked: false, provider: "google", url: "https://example.com/google" },
      {
        linked: false,
        provider: "facebook",
        url: "https://example.com/facebook",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<MoreLoginModal {...baseProps} />);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("renders SSO button when ssoUrl is provided", () => {
    render(<MoreLoginModal {...baseProps} />);
    expect(screen.getByText("SSO Login")).toBeInTheDocument();
  });

  it("does not render SSO button when ssoUrl is empty", () => {
    render(<MoreLoginModal {...baseProps} ssoUrl="" />);
    expect(screen.queryByText("SSO Login")).not.toBeInTheDocument();
  });

  it("renders all provided social providers", () => {
    render(<MoreLoginModal {...baseProps} />);
    expect(screen.getByText(getBrandName("ProviderGoogle"))).toBeInTheDocument();
    expect(screen.getByText(getBrandName("ProviderFacebook"))).toBeInTheDocument();
  });

  it("calls onSocialLoginClick when click on provider", () => {
    render(<MoreLoginModal {...baseProps} />);
    const provider = screen.getByTestId("more-login-provider-item-google");
    fireEvent.click(provider);
    expect(baseProps.onSocialLoginClick).toHaveBeenCalled();
  });
});
