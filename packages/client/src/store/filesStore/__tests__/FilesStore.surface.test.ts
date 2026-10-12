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

// Freezes the set of public member names exposed by FilesStore. Any accidental
// rename/removal/addition during refactoring flips this snapshot — the tripwire
// that guarantees the 55 consumers keep seeing the same `filesStore.X` API.
//
// Regenerate ONLY on a deliberate public-surface change (e.g. dead-code
// removal, Phase 6) with `-u`, and call it out in the commit message.
describe("FilesStore — public surface", () => {
  const publicMemberNames = () => {
    const store = createTestFilesStore();
    const names = new Set<string>();

    // Own enumerable members: observable fields + arrow-function methods.
    for (const key of Object.keys(store)) {
      if (!key.startsWith("_") && !key.startsWith("$")) names.add(key);
    }
    // Getters (computeds) live as accessors on the prototype.
    const proto = Object.getPrototypeOf(store);
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === "constructor") continue;
      if (key.startsWith("_") || key.startsWith("$")) continue;
      names.add(key);
    }
    return [...names].sort();
  };

  it("exposes a stable set of public members", () => {
    expect(publicMemberNames()).toMatchSnapshot();
  });
});
