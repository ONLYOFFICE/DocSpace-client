import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import DashboardTourStore from "../DashboardTourStore";

const USER = "user-1";
const OTHER_USER = "user-2";
const KEY = `dashboard_welcome_seen_${USER}`;

describe("DashboardTourStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("the welcome flag", () => {
    it("starts hidden, so an already-dismissed welcome never flashes", () => {
      // The value is only known once storage has been read. Starting at `false`
      // would put the modal on screen for the frame before that — for every
      // user, on every load.
      expect(new DashboardTourStore().isWelcomeSeen).toBe(true);
    });

    it("is lowered for a user who has not seen it", () => {
      const store = new DashboardTourStore();

      store.hydrateWelcome(USER);

      expect(store.isWelcomeSeen).toBe(false);
    });

    it("is raised for a user who has", () => {
      localStorage.setItem(KEY, "true");
      const store = new DashboardTourStore();

      store.hydrateWelcome(USER);

      expect(store.isWelcomeSeen).toBe(true);
    });

    it("is tracked per user, because a browser is shared", () => {
      const store = new DashboardTourStore();
      store.dismissWelcome(USER);

      store.hydrateWelcome(OTHER_USER);

      expect(store.isWelcomeSeen).toBe(false);
    });

    it("stays as it was until a user id is known", () => {
      const store = new DashboardTourStore();

      store.hydrateWelcome(undefined);

      // Still the pessimistic default: nothing is shown before we know who is
      // asking.
      expect(store.isWelcomeSeen).toBe(true);
    });

    it("is persisted on dismiss", () => {
      const store = new DashboardTourStore();

      store.dismissWelcome(USER);

      expect(store.isWelcomeSeen).toBe(true);
      expect(localStorage.getItem(KEY)).toBe("true");
    });

    it("survives completing the tour", () => {
      // "Has been offered the tour" is not "has taken the tour": somebody who
      // walks out halfway must not meet the modal again on their next visit.
      const store = new DashboardTourStore();
      store.dismissWelcome(USER);
      store.requestTour();
      store.startTour();

      store.completeTour();

      expect(store.isWelcomeSeen).toBe(true);
      expect(localStorage.getItem(KEY)).toBe("true");
    });

    it("holds in memory when storage cannot be written", () => {
      // Private browsing, storage disabled, quota spent. The modal must not come
      // back on the next navigation within the session.
      const store = new DashboardTourStore();
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("nope");
      });

      expect(() => store.dismissWelcome(USER)).not.toThrow();
      expect(store.isWelcomeSeen).toBe(true);
    });

    it("survives storage that cannot be read", () => {
      const store = new DashboardTourStore();
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("nope");
      });

      expect(() => store.hydrateWelcome(USER)).not.toThrow();
      // Unreadable storage reads as "not seen", which offers the welcome once
      // per session rather than never.
      expect(store.isWelcomeSeen).toBe(false);
    });
  });

  describe("the tour request", () => {
    it("is spent when the tour starts", () => {
      const store = new DashboardTourStore();

      store.requestTour();
      expect(store.isPending).toBe(true);

      store.startTour();
      expect(store.isPending).toBe(false);
      expect(store.isRunning).toBe(true);
    });

    it("is cleared along with the run when the tour ends", () => {
      const store = new DashboardTourStore();
      store.requestTour();
      store.startTour();

      store.completeTour();

      expect(store.isRunning).toBe(false);
      expect(store.isPending).toBe(false);
    });
  });
});
