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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { NextButton } from "./NextButton";
import { PrevButton } from "./PrevButton";
import styles from "./Buttons.module.scss";

describe("NextButton", () => {
  const mockNextClick = vi.fn();

  beforeEach(() => {
    mockNextClick.mockClear();
  });

  it("renders correctly", () => {
    render(<NextButton nextClick={mockNextClick} />);
    const button = screen.getByTestId("next-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Next");
  });

  it("applies correct classes for non-PDF files", () => {
    render(<NextButton nextClick={mockNextClick} isPDFFile={false} />);
    const button = screen.getByTestId("next-button");
    expect(button).toHaveClass(styles.right);
    expect(button).not.toHaveClass(styles.isPDFFile);
  });

  it("applies correct classes for PDF files", () => {
    render(<NextButton nextClick={mockNextClick} isPDFFile />);
    const button = screen.getByTestId("next-button");
    expect(button).toHaveClass(styles.isPDFFile);
  });

  it("calls nextClick when clicked", () => {
    render(<NextButton nextClick={mockNextClick} />);
    const button = screen.getByTestId("next-button");
    fireEvent.click(button);
    expect(mockNextClick).toHaveBeenCalledTimes(1);
  });
});

describe("PrevButton", () => {
  const mockPrevClick = vi.fn();

  beforeEach(() => {
    mockPrevClick.mockClear();
  });

  it("renders correctly", () => {
    render(<PrevButton prevClick={mockPrevClick} />);
    const button = screen.getByTestId("prev-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Previous");
  });

  it("applies correct classes", () => {
    render(<PrevButton prevClick={mockPrevClick} />);
    const button = screen.getByTestId("prev-button");
    expect(button).toHaveClass(styles.left);
  });

  it("calls prevClick when clicked", () => {
    render(<PrevButton prevClick={mockPrevClick} />);
    const button = screen.getByTestId("prev-button");
    fireEvent.click(button);
    expect(mockPrevClick).toHaveBeenCalledTimes(1);
  });
});
