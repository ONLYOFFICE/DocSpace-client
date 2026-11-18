import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TFrameConfig } from "@docspace/shared/types/Frame";

const frameCallEvent = vi.hoisted(() => vi.fn());

vi.mock("@docspace/shared/utils/common", () => ({ frameCallEvent }));

import openDocEditor from "./open-doc-editor";

const hostConfig = {
  events: { onEditorOpen: "onEditorOpen" },
} as unknown as TFrameConfig;

describe("openDocEditor: the onEditorOpen host event", () => {
  let open: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    frameCallEvent.mockClear();
    open = vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    open.mockRestore();
  });

  it("Host subscribed, encrypted file", () => {
    openDocEditor({
      fileId: 7,
      openInSameTab: false,
      frameConfig: hostConfig,
      file: { id: 7, title: "plan.docx", encrypted: true },
    });

    expect(frameCallEvent).not.toHaveBeenCalled();
    expect(open).toHaveBeenCalledTimes(1);
    expect(String(open.mock.calls[0][0])).toContain("/doceditor?fileId=7");
  });

  it("Host subscribed, file not encrypted", () => {
    openDocEditor({
      fileId: 8,
      openInSameTab: false,
      frameConfig: hostConfig,
      file: { id: 8, title: "plan.docx", encrypted: false },
    });

    expect(frameCallEvent).toHaveBeenCalledTimes(1);
    expect(frameCallEvent.mock.calls[0][0]).toMatchObject({
      event: "onEditorOpen",
      data: { id: 8 },
    });
    expect(open).not.toHaveBeenCalled();
  });
});
