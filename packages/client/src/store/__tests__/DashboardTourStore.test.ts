import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import DashboardTourStore from "../DashboardTourStore";

describe("DashboardTourStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
