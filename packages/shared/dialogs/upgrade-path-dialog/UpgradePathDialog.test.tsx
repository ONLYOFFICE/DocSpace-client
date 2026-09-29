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
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { UpgradePathDialog } from "./index";
import {
  ENTERPRISE_TRIAL_PATH,
  getUpgradeTrialUrl,
} from "./UpgradePathDialog.constants";

const defaultProps = {
  visible: true,
  onClose: vi.fn(),
  demoOrderUrl: "https://example.com/demo",
  feedbackAndSupportUrl: "https://example.com/support",
  salesEmail: "sales@example.com",
};

describe("UpgradePathDialog", () => {
  it("renders both upgrade solutions", () => {
    render(<UpgradePathDialog {...defaultProps} />);

    expect(screen.getByTestId("upgrade-path-enterprise")).toBeInTheDocument();
    expect(screen.getByTestId("upgrade-path-developer")).toBeInTheDocument();
  });

  it("renders the contact links in the footer", () => {
    render(<UpgradePathDialog {...defaultProps} />);

    expect(screen.getByTestId("upgrade-path-demo-link")).toHaveAttribute(
      "href",
      defaultProps.demoOrderUrl,
    );
    expect(screen.getByTestId("upgrade-path-support-link")).toHaveAttribute(
      "href",
      defaultProps.feedbackAndSupportUrl,
    );
    expect(screen.getByTestId("upgrade-path-purchase-link")).toHaveAttribute(
      "href",
      `mailto:${defaultProps.salesEmail}`,
    );
  });

  it("hides the purchase link until the sales email is known", () => {
    render(<UpgradePathDialog {...defaultProps} salesEmail="" />);

    expect(
      screen.queryByTestId("upgrade-path-purchase-link"),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("upgrade-path-demo-link")).toBeInTheDocument();
  });

  it("disables the trial buttons until a handler is provided", () => {
    render(<UpgradePathDialog {...defaultProps} />);

    expect(screen.getByTestId("upgrade-path-enterprise-trial")).toBeDisabled();
    expect(screen.getByTestId("upgrade-path-developer-trial")).toBeDisabled();
  });

  it("starts the matching trial", async () => {
    const user = userEvent.setup();
    const onStartEnterpriseTrial = vi.fn();
    const onStartDeveloperTrial = vi.fn();

    render(
      <UpgradePathDialog
        {...defaultProps}
        onStartEnterpriseTrial={onStartEnterpriseTrial}
        onStartDeveloperTrial={onStartDeveloperTrial}
      />,
    );

    await user.click(screen.getByTestId("upgrade-path-developer-trial"));

    expect(onStartDeveloperTrial).toHaveBeenCalledTimes(1);
    expect(onStartEnterpriseTrial).not.toHaveBeenCalled();
  });
});

describe("getUpgradeTrialUrl", () => {
  it("joins the site domain and the trial path", () => {
    expect(
      getUpgradeTrialUrl("https://www.onlyoffice.com/", ENTERPRISE_TRIAL_PATH),
    ).toBe("https://www.onlyoffice.com/download#docspace-enterprise");
  });
});
