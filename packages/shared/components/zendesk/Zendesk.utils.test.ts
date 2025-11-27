import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { zendeskAPI } from "./Zendesk.utils";

describe("ZendeskAPI", () => {
  let originalZE: typeof window.zE;

  beforeEach(() => {
    // Store original zE if it exists
    originalZE = window.zE;
    // Clear any changes before each test
    zendeskAPI.clearChanges();
    // Reset window.zE
    // @ts-expect-error Fix types
    delete window.zE;
  });

  afterEach(() => {
    // Restore original zE
    window.zE = originalZE;
  });

  describe("addChanges", () => {
    it("should add changes to waitingChanges when Zendesk is not initialized", () => {
      const args = ["webWidget", "hide"];
      zendeskAPI.addChanges(...args);

      expect(zendeskAPI.getChanges()).toHaveLength(1);
      expect(zendeskAPI.getChanges()[0]).toEqual(args);
    });

    it("should call window.zE when Zendesk is initialized", () => {
      const mockZE = vi.fn();
      window.zE = mockZE;

      const args = ["webWidget", "show"];
      zendeskAPI.addChanges(...args);

      expect(mockZE).toHaveBeenCalledWith(...args);
      expect(zendeskAPI.getChanges()).toHaveLength(0);
    });

    it("should handle multiple changes when Zendesk is not initialized", () => {
      const args1 = ["webWidget", "show"];
      const args2 = [
        "webWidget",
        "updateSettings",
        { color: { theme: "#000000" } },
      ];

      zendeskAPI.addChanges(...args1);
      zendeskAPI.addChanges(...args2);

      expect(zendeskAPI.getChanges()).toHaveLength(2);
      expect(zendeskAPI.getChanges()[0]).toEqual(args1);
      expect(zendeskAPI.getChanges()[1]).toEqual(args2);
    });

    it("should not add changes to queue when Zendesk is initialized", () => {
      const mockZE = vi.fn();
      window.zE = mockZE;

      const args = ["webWidget", "show"];
      zendeskAPI.addChanges(...args);

      expect(zendeskAPI.getChanges()).toHaveLength(0);
    });
  });

  describe("getChanges", () => {
    it("should return empty array when no changes are queued", () => {
      expect(zendeskAPI.getChanges()).toEqual([]);
    });

    it("should return all queued changes", () => {
      const args1 = ["webWidget", "show"];
      const args2 = ["webWidget", "hide"];

      zendeskAPI.addChanges(...args1);
      zendeskAPI.addChanges(...args2);

      const changes = zendeskAPI.getChanges();
      expect(changes).toHaveLength(2);
      expect(changes[0]).toEqual(args1);
      expect(changes[1]).toEqual(args2);
    });
  });

  describe("clearChanges", () => {
    it("should clear all waiting changes", () => {
      zendeskAPI.addChanges("webWidget", "show");
      zendeskAPI.addChanges("webWidget", "hide");
      expect(zendeskAPI.getChanges()).toHaveLength(2);

      zendeskAPI.clearChanges();
      expect(zendeskAPI.getChanges()).toHaveLength(0);
    });

    it("should work when there are no changes", () => {
      expect(zendeskAPI.getChanges()).toHaveLength(0);
      zendeskAPI.clearChanges();
      expect(zendeskAPI.getChanges()).toHaveLength(0);
    });
  });
});
