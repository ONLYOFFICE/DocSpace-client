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

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerDuration } from "./index";

describe("PlayerDuration", () => {
  const defaultProps = {
    currentTime: 65, // 1:05
    duration: 180, // 3:00
  };

  it("renders correctly with default props", () => {
    render(<PlayerDuration {...defaultProps} />);

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("1:05");
    expect(totalDuration).toHaveTextContent("3:00");
  });

  it("renders zero values correctly", () => {
    render(<PlayerDuration currentTime={0} duration={0} />);

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("0:00");
    expect(totalDuration).toHaveTextContent("0:00");
  });

  it("renders long duration correctly", () => {
    render(
      <PlayerDuration
        currentTime={3665} // 1:01:05
        duration={7325} // 2:02:05
      />,
    );

    const currentTime = screen.getByTestId("current-time");
    const totalDuration = screen.getByTestId("total-duration");

    expect(currentTime).toHaveTextContent("1:01:05");
    expect(totalDuration).toHaveTextContent("2:02:05");
  });
});
