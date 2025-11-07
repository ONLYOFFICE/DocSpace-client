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
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { InputSize } from "../text-input";
import { FileInput } from "./FileInput";
import styles from "./FileInput.module.scss";

// Mock images
vi.mock(
  "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url",
  () => "test-file-stub",
);
vi.mock("PUBLIC_DIR/images/document.react.svg?url", () => "test-file-stub");

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock toastr
vi.mock("../toast", () => ({
  toastr: {
    error: vi.fn(),
  },
}));

describe("<FileInput />", () => {
  const mockOnInput = vi.fn();
  const defaultProps = {
    size: InputSize.base,
    onInput: mockOnInput,
  };

  beforeEach(() => {
    mockOnInput.mockClear();
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<FileInput {...defaultProps} />);
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
    expect(screen.getByTestId("icon-button")).toBeInTheDocument();
  });

  it("handles file input correctly", async () => {
    render(<FileInput {...defaultProps} />);
    const fileInput = screen.getByRole("button");
    const file = new File(["test"], "test.txt", { type: "text/plain" });

    await act(async () => {
      fireEvent.drop(fileInput, {
        dataTransfer: {
          files: [file],
          types: ["Files"],
        },
      });
    });
  });

  it("applies correct size class", () => {
    render(<FileInput {...defaultProps} size={InputSize.base} />);
    const input = screen.getByTestId("text-input");
    expect(input).toHaveAttribute("data-size", "base");
  });

  it("handles disabled state correctly", () => {
    render(<FileInput {...defaultProps} isDisabled />);
    const fileInput = screen.getByTestId("file-input");

    // Check for disabled class
    expect(fileInput).toHaveClass(styles.disabled);

    // Check that the TextInput is disabled
    const textInput = screen.getByRole("textbox");
    expect(textInput).toBeDisabled();

    // Verify dropzone is disabled via noClick prop
    expect(fileInput).toHaveAttribute("aria-disabled", "true");
  });

  it("handles loading state correctly", () => {
    render(<FileInput {...defaultProps} isLoading />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByTestId("icon-button")).not.toBeInTheDocument();
  });

  it("handles error state correctly", () => {
    render(<FileInput {...defaultProps} hasError />);
    const input = screen.getByTestId("text-input");
    expect(input).toHaveAttribute("data-error", "true");
  });

  it("handles warning state correctly", () => {
    render(<FileInput {...defaultProps} hasWarning />);
    const input = screen.getByTestId("text-input");
    expect(input).toHaveAttribute("data-warning", "true");
  });
});
