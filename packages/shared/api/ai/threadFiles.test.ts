// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn(async (_options: unknown): Promise<unknown> => null);

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

import { getAiThreadArtifacts, getAiThreadAttachments } from "./threadFiles";

const file = { id: 81, title: "dogs.docx" };

describe("the files of a conversation", () => {
  beforeEach(() => {
    request.mockReset();
  });

  // The Files service counts these lists, and the API client turns an answer
  // that carries `total` into `{ total, items }`.
  it("reads the files out of a counted list", async () => {
    request.mockResolvedValue({ total: 1, items: [file] });

    expect(await getAiThreadAttachments(37, "t1")).toEqual([file]);
    expect(await getAiThreadArtifacts(37, "t1")).toEqual([file]);
    expect(request.mock.calls.map(([options]) => options)).toEqual([
      {
        method: "GET",
        url: "/files/rooms/37/threads/t1/attachments?sortBy=DateAndTime&sortOrder=descending",
      },
      {
        method: "GET",
        url: "/files/rooms/37/threads/t1/artifacts?sortBy=DateAndTime&sortOrder=descending",
      },
    ]);
  });

  it("takes a plain array as it is", async () => {
    request.mockResolvedValue([file]);

    expect(await getAiThreadAttachments(37, "t1")).toEqual([file]);
  });

  it("is empty for an answer without files", async () => {
    request.mockResolvedValueOnce(null);
    expect(await getAiThreadArtifacts(37, "t1")).toEqual([]);

    request.mockResolvedValueOnce({ total: 0, items: undefined });
    expect(await getAiThreadAttachments(37, "t1")).toEqual([]);
  });
});
