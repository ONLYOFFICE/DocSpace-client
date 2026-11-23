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

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { navigate, router } = vi.hoisted(() => ({
  navigate: vi.fn(),
  router: {
    location: { pathname: "/", search: "" },
    params: {} as Record<string, string>,
  },
}));

vi.mock("react-router", () => ({
  useNavigate: () => navigate,
  useLocation: () => router.location,
  useParams: () => router.params,
}));
vi.mock("SRC_DIR/i18n", () => ({
  default: { t: (k: string) => k, exists: () => true, language: "en" },
}));

import useFiles, { type UseFilesProps } from "../useFiles";

const fetchFiles = vi.fn(async () => {});
const fetchRooms = vi.fn(async () => {});

const open = (pathname: string, search = "") => {
  window.history.replaceState(null, "", `${pathname}${search}`);
  router.location = { pathname, search };
  const room = pathname.split("/").find((part) => /^\d+$/.test(part));
  router.params = room ? { room } : {};

  const { result } = renderHook(() =>
    useFiles({
      fetchFiles,
      fetchRooms,
      getFileInfo: vi.fn(),
      setIsPreview: vi.fn(),
      setIsUpdatingRowItem: vi.fn(),
      wsCreatedPDFForm: vi.fn(),
      playlist: [],
      setToPreviewFile: vi.fn(),
      gallerySelected: null,
      isVisibleInfoPanelTemplateGallery: false,
      currentExtensionGallery: "",
      userId: "user-1",
      setIsSectionHeaderLoading: vi.fn(),
      selectedFolderStore: {},
    } as unknown as UseFilesProps),
  );

  return result.current.getFiles();
};

describe("useFiles: room address", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it.each([
    ["private", "/private/12/filter", "/private/12/filter?folder=12"],
    ["private, without /filter", "/private/12", "/private/12/filter?folder=12"],
    ["Rooms", "/rooms/shared/12/filter", "/rooms/shared/12/filter?folder=12"],
    ["Forms", "/forms/12/filter", "/forms/12/filter?folder=12"],
  ])(
    "Room address without the folder parameter: %s",
    async (_name, address, expected) => {
      await open(address);

      expect(navigate).toHaveBeenCalledTimes(1);
      expect(navigate).toHaveBeenCalledWith(expected, { replace: true });
      expect(fetchRooms).not.toHaveBeenCalled();
    },
  );

  it.each([
    ["private", "/private/12/filter"],
    ["Rooms", "/rooms/shared/12/filter"],
    ["Forms", "/forms/12/filter"],
  ])("Room address: %s", async (_name, address) => {
    await open(address, "?folder=12");

    expect(navigate).not.toHaveBeenCalled();
    expect(fetchFiles).toHaveBeenCalledWith("12", expect.anything());
  });

  it("leaves a room address with other list parameters as it is", async () => {
    await open("/private/12/filter", "?page=1&count=100");

    expect(navigate).not.toHaveBeenCalled();
    expect(fetchRooms).toHaveBeenCalledTimes(1);
  });
});
