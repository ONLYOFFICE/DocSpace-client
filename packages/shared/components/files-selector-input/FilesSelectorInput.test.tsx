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
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Use vi.hoisted to ensure mocks are applied before any module loading
const mocks = vi.hoisted(() => ({
  FilesSelectorMock: vi.fn((props: { isPanelVisible?: boolean }) => {
    const { isPanelVisible } = props;
    return (
      <div data-testid="files-selector" data-visible={isPanelVisible}>
        FilesSelector
      </div>
    );
  }),
  FileInputMock: vi.fn(({ onClick }: { onClick?: () => void }) => (
    <div data-testid="file-input" onClick={onClick}>
      File Input
    </div>
  )),
}));

// Mock using the package path as it's imported in FilesSelectorInput.tsx
vi.mock("@docspace/ui-kit/selectors/Files", () => ({
  __esModule: true,
  default: mocks.FilesSelectorMock,
}));

vi.mock("@docspace/ui-kit/components/file-input", () => ({
  __esModule: true,
  FileInput: mocks.FileInputMock,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (str: string) => str,
  }),
}));

// Import React after mocks
import React from "react";
import { mockDefaultProps } from "./mockData";
import { FilesSelectorInput } from "./index";

describe("FilesSelectorInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", async () => {
    render(<FilesSelectorInput {...mockDefaultProps} />);

    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });

  it("applies custom width correctly", async () => {
    const customWidth = "500px";
    render(<FilesSelectorInput {...mockDefaultProps} maxWidth={customWidth} />);

    const container = screen.getByTestId("files-selector-input");
    expect(container).toHaveStyle(`max-width: ${customWidth}`);
  });

  it("passes className to the container", async () => {
    const customClassName = "custom-class";
    render(
      <FilesSelectorInput {...mockDefaultProps} className={customClassName} />,
    );

    const container = screen.getByTestId("files-selector-input");
    expect(container).toHaveClass(customClassName);
  });

  it("make files selector visible after click on file input", async () => {
    render(<FilesSelectorInput {...mockDefaultProps} />);

    const fileInput = screen.getByTestId("file-input");

    await userEvent.click(fileInput);

    const filesSelector = screen.getByTestId("files-selector");
    // Check if data-visible attribute exists and is truthy (could be true or "true")
    expect(filesSelector).toHaveAttribute("data-visible");
    expect(filesSelector.getAttribute("data-visible")).toBeTruthy();
  });
});
