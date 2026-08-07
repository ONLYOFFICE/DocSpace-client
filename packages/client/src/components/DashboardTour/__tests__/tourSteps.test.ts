import { describe, it, expect } from "vitest";
import type { TFunction } from "i18next";

import { getTourSteps, type TourStepFlags } from "../tourSteps";

/** Echo the key back, so a step can be identified by the key it rendered. */
const t = ((key: string) => key) as unknown as TFunction;

const steps = (flags: TourStepFlags) => getTourSteps(t, undefined, flags);

const titles = (flags: TourStepFlags) => steps(flags).map((step) => step.title);

const PROFILE_TARGET = '[data-tour-id="dashboard-profile"]';
const CREATE_TARGET = '[data-tour-id="dashboard-create"]';
const APPS_TARGET = '[data-tour-id="dashboard-apps"]';
const OVERVIEW_TARGET = '[data-item-id="dashboard"]';

/** The four cards the dashboard renders today, in grid order. */
const ALL_APPS = ["ai-files", "ai-rooms", "ai-forms", "ai-agents"];

/** An admin on a dashboard showing everything it can. */
const fullFlags: TourStepFlags = {
  hasProfileCard: true,
  appIds: ALL_APPS,
};

describe("dashboard tour steps", () => {
  it("walks the page top to bottom and ends on the sidebar", () => {
    expect(steps(fullFlags).map((step) => step.target)).toEqual([
      PROFILE_TARGET,
      CREATE_TARGET,
      APPS_TARGET,
      OVERVIEW_TARGET,
    ]);
  });

  it("drops the profile step when the card is not on the page", () => {
    // Non-admins never get the card, and admins can dismiss it for good.
    const flags = { ...fullFlags, hasProfileCard: false };

    expect(titles(flags)).not.toContain("DashboardTour:DashboardProfileTitle");
    expect(steps(flags)).toHaveLength(3);
  });

  it("keeps the create and overview steps whatever else is missing", () => {
    // Neither depends on anything optional: the quick actions are always
    // rendered, and the Overview item is what the page was reached from.
    const bare = steps({ hasProfileCard: false, appIds: [] });

    expect(bare.map((step) => step.target)).toEqual([
      CREATE_TARGET,
      OVERVIEW_TARGET,
    ]);
  });

  describe("the apps step", () => {
    /**
     * The regression this file exists for. `unionSpotlight` resolves each
     * selector it is handed with `querySelector` — one element apiece — so a
     * single selector shared by every card lit up the first card alone, which
     * showed the user a spotlight over Files while the tooltip talked about all
     * four. Every card has to be named individually.
     */
    it("names every app card so the spotlight covers the whole row", () => {
      // A grid of four cards laid out in a row, each 100 wide with a 10 gap, so
      // the union of all four spans x=0..430 while any single one spans 100.
      // Widths come from stubbed rects: jsdom measures everything as 0x0, and
      // `unionSpotlight` drops degenerate rects on purpose.
      document.body.innerHTML = `
        <section data-tour-id="dashboard-apps">
          ${ALL_APPS.map(
            (id) => `<button data-tour-id="dashboard-app-card-${id}"></button>`,
          ).join("")}
        </section>`;

      ALL_APPS.forEach((id, index) => {
        const card = document.querySelector<HTMLElement>(
          `[data-tour-id="dashboard-app-card-${id}"]`,
        )!;
        const left = index * 110;
        card.getBoundingClientRect = () =>
          ({
            top: 0,
            left,
            right: left + 100,
            bottom: 60,
            width: 100,
            height: 60,
          }) as DOMRect;
      });

      const [appsStep] = steps(fullFlags).filter(
        (step) => step.target === APPS_TARGET,
      );

      const spotlight = (
        appsStep.spotlightTarget as () => HTMLElement | null
      )();

      // The stand-in node carries the union rect: all four cards, not the first.
      expect(spotlight?.style.left).toBe("0px");
      expect(spotlight?.style.width).toBe("430px");

      document.body.innerHTML = "";
    });

    it("is dropped when the grid has no cards", () => {
      const flags = { ...fullFlags, appIds: [] };

      expect(titles(flags)).not.toContain("DashboardTour:DashboardAppsTitle");
    });

    it("anchors the tooltip on the section, not on a card", () => {
      // The section heading has to stay outside the spotlight while the text
      // speaks about the row as a whole.
      const [appsStep] = steps(fullFlags).filter(
        (step) => step.title === "DashboardTour:DashboardAppsTitle",
      );

      expect(appsStep.target).toBe(APPS_TARGET);
    });

    it("covers however many cards the grid actually rendered", () => {
      // The grid is filtered, so the step must not assume four.
      const flags = { ...fullFlags, appIds: ["ai-files", "ai-rooms"] };

      expect(titles(flags)).toContain("DashboardTour:DashboardAppsTitle");
    });
  });
});
