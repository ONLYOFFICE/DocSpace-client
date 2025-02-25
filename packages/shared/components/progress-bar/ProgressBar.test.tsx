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

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { ProgressBar } from ".";

describe("<ProgressBar />", () => {
  const defaultProps = {
    percent: 50,
  };

  it("renders without error", () => {
    render(<ProgressBar {...defaultProps} />);
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });

  describe("Label", () => {
    it("renders label when provided", () => {
      const label = "Uploading files...";
      render(<ProgressBar {...defaultProps} label={label} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(label)).toHaveClass("fullText");
    });

    it("sets label as title attribute", () => {
      const label = "Uploading files...";
      render(<ProgressBar {...defaultProps} label={label} />);
      expect(screen.getByText(label)).toHaveAttribute("title", label);
    });
  });

  describe("Progress behavior", () => {
    it("caps progress at 100% when exceeding", () => {
      render(<ProgressBar {...defaultProps} percent={150} />);
      const progressBar = screen.getByTestId("progress-bar");
      expect(progressBar).toHaveAttribute("data-progress", "100");
    });

    it("shows infinite progress animation when enabled", () => {
      render(<ProgressBar {...defaultProps} isInfiniteProgress />);
      expect(screen.getByTestId("progress-bar-animation")).toBeInTheDocument();
    });

    it("shows regular progress bar when not infinite", () => {
      render(<ProgressBar {...defaultProps} />);
      expect(screen.getByTestId("progress-bar-percent")).toBeInTheDocument();
    });
  });

  describe("Status and error states", () => {
    it("displays status message", () => {
      const status = "Processing...";
      render(<ProgressBar {...defaultProps} status={status} />);
      const statusElement = screen.getByText(status);
      expect(statusElement).toHaveClass("statusText");
      expect(statusElement).toHaveAttribute("title", status);
    });

    it("displays error message with error styling", () => {
      const error = "Upload failed";
      render(<ProgressBar {...defaultProps} error={error} />);
      const errorElement = screen.getByText(error);
      expect(errorElement).toHaveClass("statusError");
      expect(errorElement).toHaveAttribute("title", error);
    });
  });

  it("applies custom className when provided", () => {
    const customClass = "custom-progress";
    render(<ProgressBar {...defaultProps} className={customClass} />);
    expect(screen.getByTestId("progress-bar")).toHaveClass(customClass);
  });
});
