// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";

import { getDeleteVariant } from "./getDeleteVariant";

// Bug 82886: in a private room the recycle bin is bypassed on purpose (see
// useTrashActions: immediately = isTrash || !!encryptedActions), but the dialog
// still promised "This item will be moved to Trash." The user agreed to a
// reversible action and got an irreversible one, so the warning must follow the
// same predicate as the delete call itself.

describe("getDeleteVariant", () => {
  it("promises the recycle bin in an ordinary folder", () => {
    expect(getDeleteVariant({ isPermanent: false, itemCount: 1 })).toBe(
      "trash-one",
    );
    expect(getDeleteVariant({ isPermanent: false, itemCount: 4 })).toBe(
      "trash-many",
    );
  });

  it("warns about permanent deletion whenever the bin is bypassed", () => {
    expect(getDeleteVariant({ isPermanent: true, itemCount: 1 })).toBe(
      "permanent-one",
    );
    expect(getDeleteVariant({ isPermanent: true, itemCount: 4 })).toBe(
      "permanent-many",
    );
  });

  it("keeps the empty-trash wording regardless of the other flags", () => {
    expect(
      getDeleteVariant({ isEmptyTrash: true, isPermanent: true, itemCount: 0 }),
    ).toBe("empty-trash");
    expect(
      getDeleteVariant({
        isEmptyTrash: true,
        isPermanent: false,
        itemCount: 3,
      }),
    ).toBe("empty-trash");
  });

  it("treats a single item as singular and anything else as plural", () => {
    expect(getDeleteVariant({ isPermanent: true, itemCount: 0 })).toBe(
      "permanent-many",
    );
    expect(getDeleteVariant({ isPermanent: false, itemCount: 2 })).toBe(
      "trash-many",
    );
  });
});
