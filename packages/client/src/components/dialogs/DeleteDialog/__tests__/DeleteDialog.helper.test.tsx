// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";

import { getDialogContent } from "../DeleteDialog.helper";

// Bug 82886: a private room bypasses the recycle bin on purpose
// (delete.helpers.ts: immediately = !!(isRecycleBinFolder || isPrivacyFolder)),
// but the note still read "You are about to move X to Trash. The file will be
// permanently deleted in 30 days." The user agreed to a reversible action and
// got an irreversible one, so the note must follow the same predicate as the
// delete call.

const t = (key: string) => key;

/** Collect every i18n key and literal string the note is built from, without
 *  rendering (the note contains <Trans> interpolation objects). */
const keysOf = (node: unknown, out: string[] = []): string[] => {
  if (node == null || typeof node === "boolean") return out;
  if (typeof node === "string" || typeof node === "number") {
    out.push(String(node));
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) keysOf(child, out);
    return out;
  }
  if (typeof node === "object") {
    const props = (node as { props?: Record<string, unknown> }).props;
    if (props) {
      if (typeof props.i18nKey === "string") out.push(props.i18nKey);
      if ("children" in props) keysOf(props.children, out);
    }
  }
  return out;
};

const file = { id: 1, title: "New document.docx", fileExst: ".docx" };
const folder = { id: 2, title: "New folder", isFolder: true, parentId: 3 };

type ContentArgs = {
  selection: object[];
  isRecycleBinFolder?: boolean;
  isRoom?: boolean;
  isPrivacyFolder?: boolean;
};

const noteKeys = ({
  selection,
  isRecycleBinFolder = false,
  isRoom = true,
  isPrivacyFolder = false,
}: ContentArgs) =>
  keysOf(
    getDialogContent(
      t,
      selection,
      false, // isTemplate
      false, // isRoomDelete
      isRecycleBinFolder,
      false, // isPersonalRoom
      isRoom,
      false, // isTemplatesFolder
      false, // isSharedWithMeFolderRoot
      false, // isAIAgent
      false, // isAIAgentsFolderRoot
      false, // unsubscribe
      isPrivacyFolder,
    ),
  );

describe("getDialogContent — deleting from a private room", () => {
  it("warns about permanent deletion instead of promising Trash", () => {
    const keys = noteKeys({ selection: [file], isPrivacyFolder: true });

    expect(keys).toContain("Common:DeleteItemForever");
    expect(keys).not.toContain("DeleteItem");
    expect(keys).not.toContain("FileDeletedAfter");
    expect(keys).not.toContain("Common:TrashSection");
  });

  it("names the item being deleted", () => {
    const keys = noteKeys({ selection: [file], isPrivacyFolder: true });

    expect(keys).toContain("DeleteItemForeverConfirm");
  });

  it("uses the plural permanent wording for several items", () => {
    const keys = noteKeys({
      selection: [file, folder],
      isPrivacyFolder: true,
    });

    expect(keys).toContain("Common:DeleteItemsForever");
    expect(keys).not.toContain("ItemsDeletedAfter");
    expect(keys).not.toContain("Common:TrashSection");
  });

  it("still promises Trash in an ordinary room", () => {
    const keys = noteKeys({ selection: [file] });

    expect(keys).toContain("DeleteItem");
    expect(keys).toContain("FileDeletedAfter");
  });

  it("leaves the recycle-bin wording untouched", () => {
    const keys = noteKeys({
      selection: [file],
      isRecycleBinFolder: true,
      isRoom: false,
    });

    expect(keys).toContain("DeleteItemForeverConfirm");
    expect(keys).toContain("FilePermanentlyDeleted");
  });
});
