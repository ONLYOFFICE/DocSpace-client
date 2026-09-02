// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";

import { FolderType } from "../../enums";

const section = (
  id: number,
  rootFolderType: FolderType,
  sectionNew: number,
  currentNew: number,
) => ({
  new: sectionNew,
  pathParts: [],
  current: {
    id,
    parentId: 0,
    title: `folder-${id}`,
    rootFolderType,
    security: {},
    foldersCount: 0,
    filesCount: 0,
    new: currentNew,
  },
});

const response: unknown[] = [];

const request = vi.fn(async (_options: unknown) => response);

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

// eslint-disable-next-line import/first
import { getFoldersTree } from ".";

type TTreeNode = {
  rootFolderType: FolderType;
  newItems: number;
  new: number;
};

const getTree = async () => (await getFoldersTree()) as unknown as TTreeNode[];

describe("getFoldersTree", () => {
  beforeEach(() => {
    request.mockClear();
    response.length = 0;
  });

  it("keeps the Forms section in the tree", async () => {
    response.push(
      section(1, FolderType.Rooms, 0, 0),
      section(2, FolderType.Forms, 0, 0),
    );

    const tree = await getTree();

    expect(tree.map((f) => f.rootFolderType)).toEqual([
      FolderType.Rooms,
      FolderType.Forms,
    ]);
  });

  it("counts the Forms section by its own folder, not by the section total", async () => {
    response.push(section(2, FolderType.Forms, 0, 3));

    const [forms] = await getTree();

    expect(forms.newItems).toBe(3);
    expect(forms.new).toBe(3);
  });

  it("keeps counting every other section by the section total", async () => {
    response.push(section(1, FolderType.Rooms, 5, 9));

    const [rooms] = await getTree();

    expect(rooms.newItems).toBe(5);
    expect(rooms.new).toBe(5);
  });
});
