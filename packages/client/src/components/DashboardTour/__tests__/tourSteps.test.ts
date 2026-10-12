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
const INTEGRATIONS_TARGET = '[data-tour-id="dashboard-integrations"]';
const DEVTOOLS_TARGET = '[data-tour-id="dashboard-devtools"]';
const OVERVIEW_TARGET = '[data-item-id="dashboard"]';

/** The four cards the dashboard renders today, in grid order. */
const ALL_APPS = ["ai-files", "ai-rooms", "ai-forms", "ai-agents"];

/** An admin on a dashboard showing everything it can. */
const fullFlags: TourStepFlags = {
  hasProfileCard: true,
  appIds: ALL_APPS,
  hasIntegrations: true,
  hasDevTools: true,
};

describe("dashboard tour steps", () => {
  it("walks the page top to bottom and ends on the sidebar", () => {
    expect(steps(fullFlags).map((step) => step.target)).toEqual([
      PROFILE_TARGET,
      CREATE_TARGET,
      APPS_TARGET,
      INTEGRATIONS_TARGET,
      DEVTOOLS_TARGET,
      OVERVIEW_TARGET,
    ]);
  });

  it("drops the profile step when the card is not on the page", () => {
    // Everyone is shown the card, but anyone can dismiss it for good.
    const flags = { ...fullFlags, hasProfileCard: false };

    expect(titles(flags)).not.toContain("DashboardTour:DashboardProfileTitle");
    expect(steps(flags)).toHaveLength(5);
  });

  it("keeps the create and overview steps whatever else is missing", () => {
    // Neither depends on anything optional: the quick actions are always
    // rendered, and the Overview item is what the page was reached from.
    const bare = steps({
      hasProfileCard: false,
      appIds: [],
      hasIntegrations: false,
      hasDevTools: false,
    });

    expect(bare.map((step) => step.target)).toEqual([
      CREATE_TARGET,
      OVERVIEW_TARGET,
    ]);
  });

  describe("the integrations step", () => {
    it("sits between the apps row and the developer tools", () => {
      // It is about what to do after the products have been introduced, and it
      // is still addressed to the same person — so it comes before the developer
      // tools, which are not.
      const targets = steps(fullFlags).map((step) => step.target);

      expect(targets.indexOf(INTEGRATIONS_TARGET)).toBe(
        targets.indexOf(DEVTOOLS_TARGET) - 1,
      );
      expect(targets.indexOf(INTEGRATIONS_TARGET)).toBeGreaterThan(
        targets.indexOf(APPS_TARGET),
      );
    });

    it("is dropped when the card is not on the page", () => {
      const flags = { ...fullFlags, hasIntegrations: false };

      expect(titles(flags)).not.toContain(
        "DashboardTour:DashboardIntegrationsTitle",
      );
      expect(steps(flags)).toHaveLength(5);
    });

    it("still comes before the sidebar when the apps row is missing", () => {
      // The two are independent: an empty grid must not pull the integrations
      // step out of its place at the end.
      const flags = { ...fullFlags, appIds: [] };

      expect(steps(flags).map((step) => step.target)).toEqual([
        PROFILE_TARGET,
        CREATE_TARGET,
        INTEGRATIONS_TARGET,
        DEVTOOLS_TARGET,
        OVERVIEW_TARGET,
      ]);
    });
  });

  describe("the developer tools step", () => {
    it("is the last thing on the page, before the sidebar hand-off", () => {
      // It sits where the card does — below the integrations, at the bottom of
      // the page — and the Overview step is the tour's hand-off, so nothing
      // about the page may come after it.
      const targets = steps(fullFlags).map((step) => step.target);

      expect(targets.indexOf(DEVTOOLS_TARGET)).toBe(
        targets.indexOf(OVERVIEW_TARGET) - 1,
      );
      expect(targets.indexOf(DEVTOOLS_TARGET)).toBeGreaterThan(
        targets.indexOf(INTEGRATIONS_TARGET),
      );
    });

    it("is dropped when the card is not on the page", () => {
      const flags = { ...fullFlags, hasDevTools: false };

      expect(titles(flags)).not.toContain(
        "DashboardTour:DashboardDevToolsTitle",
      );
      expect(steps(flags)).toHaveLength(5);
    });

    it("keeps its place at the end when the integrations card is missing", () => {
      // The two cards are independent, and the DOM order the step list mirrors
      // does not change when one of them is absent.
      const flags = { ...fullFlags, hasIntegrations: false };

      expect(steps(flags).map((step) => step.target)).toEqual([
        PROFILE_TARGET,
        CREATE_TARGET,
        APPS_TARGET,
        DEVTOOLS_TARGET,
        OVERVIEW_TARGET,
      ]);
    });

    it("names the brand through a variable rather than in the string", () => {
      // The card's own title does the same (`getBrandName("OrganizationName")`);
      // a brand name baked into a translation string fails the locale tests.
      const [devToolsStep] = steps(fullFlags).filter(
        (step) => step.target === DEVTOOLS_TARGET,
      );

      expect(devToolsStep.title).toBe("DashboardTour:DashboardDevToolsTitle");
      expect(devToolsStep.content).toBe("DashboardTour:DashboardDevTools");
    });
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
