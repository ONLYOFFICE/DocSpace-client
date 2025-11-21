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
import {
  screen,
  createEvent,
  fireEvent,
  act,
  render,
} from "@testing-library/react";
import Dropzone from "./index";
import styles from "./Dropzone.module.scss";

describe("Dropzone", () => {
  const defaultProps = {
    isLoading: false,
    linkMainText: "Click to upload",
    linkSecondaryText: "or drag and drop files here",
    exstsText: "Supported file types: PDF, DOC, DOCX",
    accept: [".pdf", ".doc", ".docx"],

    onDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error", () => {
    render(<Dropzone {...defaultProps} />);

    const dropzone = screen.getByTestId("dropzone");
    expect(dropzone).toBeInTheDocument();
    expect(dropzone).toHaveAttribute("aria-disabled", "false");
    expect(dropzone).toHaveAttribute("aria-busy", "false");

    expect(screen.getByTestId("dropzone-main-text")).toHaveTextContent(
      defaultProps.linkMainText,
    );
    expect(screen.getByTestId("dropzone-secondary-text")).toHaveTextContent(
      defaultProps.linkSecondaryText,
    );
    expect(screen.getByTestId("dropzone-file-types")).toHaveTextContent(
      defaultProps.exstsText,
    );
  });

  it("shows loader when isLoading is true", () => {
    render(<Dropzone {...defaultProps} isLoading />);

    const dropzone = screen.getByTestId("dropzone");
    expect(dropzone).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("disables dropzone when isDisabled is true", () => {
    render(<Dropzone {...defaultProps} isDisabled />);

    const dropzone = screen.getByTestId("dropzone");
    expect(dropzone).toHaveAttribute("aria-disabled", "true");

    const input = screen.getByTestId("dropzone-input");
    expect(input).toHaveAttribute("disabled");
  });

  it("handles file upload correctly", async () => {
    const onDrop = vi.fn();

    render(<Dropzone {...defaultProps} onDrop={onDrop} />);

    const file = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });

    const dropzone = screen.getByTestId("dropzone-input");

    const dropEvent = createEvent.drop(dropzone);
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: [file],
        types: ["Files"],
        items: [
          {
            kind: "file",
            type: file.type,
            getAsFile: () => file,
          },
        ],
      },
    });

    await act(async () => {
      fireEvent(dropzone, dropEvent);
    });
    await new Promise(process.nextTick);
    expect(onDrop).toHaveBeenCalledWith([file], [], expect.any(Object));
  });

  it("applies loading styles when isLoading is true", () => {
    render(<Dropzone {...defaultProps} isLoading />);

    const wrapper = screen.getByTestId("dropzone");
    expect(wrapper).toHaveClass(styles.isLoading);
    expect(wrapper).toHaveAttribute("aria-busy", "true");
  });

  it("renders custom text content", () => {
    const customProps = {
      ...defaultProps,
      linkMainText: "Custom upload text",
      linkSecondaryText: "Custom secondary text",
      exstsText: "Custom file types",
    };

    render(<Dropzone {...customProps} />);

    expect(screen.getByTestId("dropzone-main-text")).toHaveTextContent(
      customProps.linkMainText,
    );
    expect(screen.getByTestId("dropzone-secondary-text")).toHaveTextContent(
      customProps.linkSecondaryText,
    );
    expect(screen.getByTestId("dropzone-file-types")).toHaveTextContent(
      customProps.exstsText,
    );
  });

  it("has correct accessibility attributes", () => {
    render(<Dropzone {...defaultProps} />);

    const dropzone = screen.getByTestId("dropzone");
    const inputArea = screen.getByTestId("dropzone-input-area");
    const input = screen.getByTestId("dropzone-input");
    const textArea = screen.getByTestId("dropzone-text");
    const fileTypes = screen.getByTestId("dropzone-file-types");

    // Check ARIA attributes
    expect(dropzone).toHaveAttribute("aria-disabled", "false");
    expect(dropzone).toHaveAttribute("aria-busy", "false");

    expect(inputArea).toHaveAttribute("aria-label", "File upload area");
    expect(input).toHaveAttribute("aria-label", "File input");
    expect(textArea).toHaveAttribute("aria-live", "polite");
    expect(textArea).toHaveAttribute("aria-relevant", "additions removals");
    expect(fileTypes).toHaveAttribute("aria-label", "Supported file types");
  });
});
