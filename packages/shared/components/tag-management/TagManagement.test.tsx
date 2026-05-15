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
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { TagManagementPopup } from "./TagManagement.popup";
import type { TagManagementPopupProps } from "./TagManagement.types";
import * as useTagsQueryModule from "./hooks/useTagsQuery";

vi.mock("../../utils/useClickOutside", () => ({
  useClickOutside: vi.fn(),
}));

vi.mock("@docspace/ui-kit/hooks/use-is-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const defaultProps: TagManagementPopupProps = {
  tags: ["tag1", "tag2"],
  roomId: "123",
  onClose: vi.fn(),
  onSelectTag: vi.fn(),
  anchor: { current: document.createElement("div") },
  access: { canCreate: false, canSearch: true },
  roomName: "Test Room",
};

const renderWithQueryClient = (
  ui: React.ReactElement,
  queryClient = createQueryClient(),
) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("<TagManagementPopup />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loader when data is pending", () => {
    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: undefined,
      status: "pending",
      isLoading: true,
      isError: false,
      isSuccess: false,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(<TagManagementPopup {...defaultProps} />);

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
  });

  it("renders content when data is successfully loaded", async () => {
    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: ["fetchedTag1", "fetchedTag2"],
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(<TagManagementPopup {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.queryByTestId("tag-management-loader"),
      ).not.toBeInTheDocument();
    });
  });

  it("renders nothing on error", () => {
    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: undefined,
      status: "error",
      isLoading: false,
      isError: true,
      isSuccess: false,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(<TagManagementPopup {...defaultProps} />);

    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    const skeletons = document.querySelectorAll(
      '[class*="rectangle-skeleton"]',
    );
    expect(skeletons.length).toBe(0);
  });

  it("calls onClose when clicking outside", async () => {
    const onClose = vi.fn();
    const useClickOutside =
      await import("@docspace/ui-kit/utils/use-click-outside");
    const mockUseClickOutside = vi.spyOn(useClickOutside, "useClickOutside");

    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: ["tag1"],
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(
      <TagManagementPopup {...defaultProps} onClose={onClose} />,
    );

    expect(mockUseClickOutside).toHaveBeenCalled();
  });

  it("passes correct props to TagManagementProvider", async () => {
    const roomTags = ["roomTag1", "roomTag2"];
    const fetchedTags = ["fetchedTag1"];

    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: fetchedTags,
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(
      <TagManagementPopup {...defaultProps} tags={roomTags} />,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("tag-management-loader"),
      ).not.toBeInTheDocument();
    });
  });

  it("renders with empty tags array", () => {
    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: [],
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    const { container } = renderWithQueryClient(
      <TagManagementPopup {...defaultProps} tags={[]} />,
    );

    expect(container.querySelector(".loaderWrapper")).not.toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("handles mobile view correctly", async () => {
    const useIsMobile = await import("@docspace/ui-kit/hooks/use-is-mobile");
    vi.spyOn(useIsMobile, "useIsMobile").mockReturnValue(true);

    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: ["tag1"],
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(<TagManagementPopup {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
  });

  it("renders search input on success", async () => {
    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: ["tag1"],
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(<TagManagementPopup {...defaultProps} />);

    await waitFor(() => {
      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toBeInTheDocument();
    });
  });

  it("handles undefined fetched tags gracefully", async () => {
    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: undefined,
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(<TagManagementPopup {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.queryByTestId("tag-management-loader"),
      ).not.toBeInTheDocument();
    });
  });

  it("renders TagManagementFilter and TagManagementContent on success", async () => {
    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: ["tag1"],
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(<TagManagementPopup {...defaultProps} />);

    await waitFor(() => {
      const container = screen.getByRole("searchbox");
      expect(container).toBeInTheDocument();
    });
  });

  it("passes roomId to child components", async () => {
    const roomId = "test-room-123";

    vi.spyOn(useTagsQueryModule, "useTagsQuery").mockReturnValue({
      data: ["tag1"],
      status: "success",
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as UseQueryResult<string[], Error>);

    renderWithQueryClient(
      <TagManagementPopup {...defaultProps} roomId={roomId} />,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("tag-management-loader"),
      ).not.toBeInTheDocument();
    });
  });
});
