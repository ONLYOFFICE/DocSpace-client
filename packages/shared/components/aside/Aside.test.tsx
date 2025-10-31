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
import { describe, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { Aside } from ".";

describe("Aside Component", () => {
  const mockOnClose = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without error when visible", () => {
    render(
      <Aside visible onClose={mockOnClose}>
        test content
      </Aside>,
    );

    expect(screen.getByTestId("aside")).toBeInTheDocument();
    expect(screen.getByText("test content")).toBeInTheDocument();
  });

  it("renders with custom styling props", () => {
    render(
      <Aside
        visible
        onClose={mockOnClose}
        scale
        zIndex={500}
        className="custom-class"
      >
        test content
      </Aside>,
    );

    const aside = screen.getByTestId("aside");
    expect(aside).toHaveClass("custom-class");
    expect(aside).toHaveStyle({ zIndex: 500 });
  });

  it("renders without header when withoutHeader is true", () => {
    render(
      <Aside visible onClose={mockOnClose} withoutHeader>
        test content
      </Aside>,
    );

    expect(screen.queryByTestId("aside-header")).not.toBeInTheDocument();
  });

  it("renders with scrollbar when content overflows", () => {
    const longContent = "a".repeat(1000);
    render(
      <Aside visible onClose={mockOnClose}>
        {longContent}
      </Aside>,
    );

    expect(screen.getByTestId("scrollbar")).toBeInTheDocument();
  });

  it("renders with withoutBodyScroll prop", () => {
    render(
      <Aside visible onClose={mockOnClose} withoutBodyScroll>
        test content
      </Aside>,
    );

    const aside = screen.getByTestId("aside");
    expect(aside).toBeInTheDocument();
  });
});
