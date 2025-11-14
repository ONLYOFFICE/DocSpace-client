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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MoreLoginModal from "./index";
import { MoreLoginModalProps } from "./MoreLoginModal.types";

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
    expect(screen.getByText("Common:ProviderGoogle")).toBeInTheDocument();
    expect(screen.getByText("Common:ProviderFacebook")).toBeInTheDocument();
  });

  it("calls onSocialLoginClick when click on provider", () => {
    render(<MoreLoginModal {...baseProps} />);
    const provider = screen.getByTestId("more-login-provider-item-google");
    fireEvent.click(provider);
    expect(baseProps.onSocialLoginClick).toHaveBeenCalled();
  });
});
