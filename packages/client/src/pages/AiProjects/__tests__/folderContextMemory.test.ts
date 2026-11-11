import { beforeEach, describe, expect, it } from "vitest";

import { readProjectFolder, writeProjectFolder } from "../folderContextMemory";

const folder = { cloud: "docspace", id: "77", name: "Reports", path: "My documents / Reports" };

describe("project folder memory", () => {
  beforeEach(() => localStorage.clear());

  it("remembers the folder per user and project", () => {
    writeProjectFolder("u1", 5, folder);
    expect(readProjectFolder("u1", 5)).toEqual(folder);
    expect(readProjectFolder("u1", 6)).toBeNull();
    expect(readProjectFolder("u2", 5)).toBeNull();
  });

  it("forgets the folder once it is disconnected", () => {
    writeProjectFolder("u1", 5, folder);
    writeProjectFolder("u1", 5, null);
    expect(readProjectFolder("u1", 5)).toBeNull();
  });

  it("remembers nothing for an anonymous session", () => {
    writeProjectFolder(undefined, 5, folder);
    expect(localStorage.length).toBe(0);
    expect(readProjectFolder(undefined, 5)).toBeNull();
  });

  it("drops a record it cannot read", () => {
    localStorage.setItem("aiProjectFolderContext:u1:5", "{not json");
    expect(readProjectFolder("u1", 5)).toBeNull();
    localStorage.setItem("aiProjectFolderContext:u1:5", JSON.stringify({ id: 77 }));
    expect(readProjectFolder("u1", 5)).toBeNull();
  });
});
