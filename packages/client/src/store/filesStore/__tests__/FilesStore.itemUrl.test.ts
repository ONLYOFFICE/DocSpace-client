// (c) Copyright Ascensio System SIA 2009-2026
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

import { describe, it, expect } from "vitest";

import { createTestFilesStore } from "./testHarness";

// getItemUrl builds the target URL per item kind. Asserted via substring
// checks (the absolute origin/homepage varies by env) to lock the branch
// semantics before extracting the method into a helper.
describe("FilesStore.getItemUrl — characterization", () => {
  it("builds a folder url with the ?folder= query", () => {
    const store = createTestFilesStore();
    const url = store.getItemUrl(1, true, false, false);
    expect(url).toContain("?folder=1");
  });

  it("builds a doceditor url for a file", () => {
    const store = createTestFilesStore();
    const url = store.getItemUrl(7, false, false, false) as string;
    expect(url).toContain("/doceditor?fileId=7");
    expect(url).not.toContain("action=view");
    expect(url).not.toContain("share=");
  });

  it("adds action=view when the file needs conversion", () => {
    const store = createTestFilesStore();
    const url = store.getItemUrl(7, false, true, false) as string;
    expect(url).toContain("/doceditor?fileId=7");
    expect(url).toContain("action=view");
  });

  it("adds the share key when provided", () => {
    const store = createTestFilesStore();
    const url = store.getItemUrl(7, false, false, false, "abc123") as string;
    expect(url).toContain("share=abc123");
  });

  it("builds a media-view url when the player can open (non-public)", () => {
    const store = createTestFilesStore();
    const url = store.getItemUrl(7, false, false, true) as string;
    expect(url).toContain("/media/view/7");
    expect(url).not.toContain("key=");
  });

  it("appends the room key and filter params in a public room", () => {
    const store = createTestFilesStore({
      publicRoomStore: { isPublicRoom: true, publicRoomKey: "ROOMKEY" },
    });
    const url = store.getItemUrl(7, false, false, true) as string;
    expect(url).toContain("/rooms/share");
    expect(url).toContain("key=ROOMKEY");
  });
});
