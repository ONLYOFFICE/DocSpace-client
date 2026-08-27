/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Page } from "@playwright/test";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  aiConfigHandler,
  freeQuotaHandler,
  quotaHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  settingsHandler,
  tariffHandler,
  TypeSettings,
  usersByType,
  type UserType,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * What the Overview (/dashboard) looks like to everyone who can reach it.
 *
 * The page has no list of its own to render — everything on it is decided by
 * four inputs, and every one of them has already changed what is on screen at
 * least once:
 *
 *  - who is signed in: the profile card and the plan line are admin/owner-only,
 *    the create buttons need the room-create right, and a guest gets the upload
 *    link disabled with a tooltip instead;
 *  - SaaS vs standalone: Docs Connect is sold and hosted by us, so the
 *    integrations card, its dashboard tile and the "or connect Docs" link are
 *    dropped on a standalone portal, and the plan link points at the standalone
 *    payments page instead;
 *  - paid vs not: the plan line and the apps subtitle name Startup or Business
 *    and offer either an upgrade or a customize link;
 *  - the portal's AI switch: with AI services off there is no AI Chat quick
 *    action and no agent to create, so that card degrades to "Open".
 *
 * They are independent of each other, so the whole cross product is covered
 * rather than a hand-picked handful — 5 audiences x 2 editions x 2 billing
 * states x 2 AI states.
 *
 * Each case pins a reference screenshot of the whole page, and asserts the
 * handful of elements that case is *about* on top of it. The assertions are
 * what makes a local run worth anything: screenshots only compare truthfully
 * inside the Docker image (see .claude/rules/e2e-tests.md), while the
 * structural checks hold everywhere.
 */

const DASHBOARD_URL = "/dashboard";

/**
 * The clock every case is taken at.
 *
 * The tariff mock's due date is a fixed calendar date, so whether a
 * subscription reads as active depends on where the real clock happens to sit
 * relative to it — pinning "now" between the expired and the active due date
 * keeps the paid cases paid for good, instead of quietly turning into expired
 * ones the day the date passes.
 */
const FIXED_NOW = new Date("2026-02-10T12:00:00.000Z");

// The portal's own timezone would otherwise render the renewal date differently
// depending on where the run happens.
test.use({ timezoneId: "UTC" });

// packages/client/src/store/DashboardTourStore.ts — per-user, keyed on the id
// of whoever is signed in.
const welcomeKey = (userId: string) => `dashboard_welcome_seen_${userId}`;

/** The page's own anchors — see Dashboard/DashboardTour/tourSteps.ts. */
const PROFILE_CARD = '[data-tour-id="dashboard-profile"]';
const CREATE_SECTION = '[data-tour-id="dashboard-create"]';
const INTEGRATIONS_CARD = '[data-tour-id="dashboard-integrations"]';
const AGENTS_CARD_BUTTON = '[data-testid="dashboard-app-open-ai-agents"]';
const DEVTOOLS_CARD = '[data-tour-id="dashboard-devtools"]';
const APPS_SECTION = '[data-tour-id="dashboard-apps"]';
const APP_CARDS = '[data-tour-id^="dashboard-app-card-"]';
// The pencil that opens portal renaming, the one admin/owner-only control on
// the profile card. By test id rather than by its title: `IconButton` turns a
// `title` into a custom tooltip in the browser, so no title attribute is left
// to match on.
const PROFILE_RENAME_BUTTON = '[data-testid="dashboard-profile-rename"]';

/**
 * The sidebar's AI Agents entry, matched by its label rather than by its
 * `data-item-id` — that id is the tree folder's, which says nothing about which
 * app it is. A plain string rather than an anchored regex: the item's text
 * content carries the newlines of its inlined icon markup, and only the string
 * form of `hasText` normalizes those away. Nothing else in the sidebar is
 * labelled with it, and the agents sub-items carry their own labels.
 */
const sidebarAgentsItem = (page: Page) =>
  page.locator("[data-item-id]").filter({ hasText: "AI agents" });

/** The plan line, in either of the two wordings the header has for it. */
const planLine = (page: Page) =>
  page.getByText(/You are (on the free|using)\b/);

type Role = {
  /** Names the case, in the test title and in the screenshot file name. */
  key: string;
  userType: UserType;
  /** Portal admins and the owner: the profile card and the plan line. */
  isAdminOrOwner: boolean;
  /** The set allowed to create rooms — room admins are in it, users are not. */
  canCreateRooms: boolean;
  isGuest: boolean;
};

const ROLES: Role[] = [
  {
    key: "owner",
    userType: "owner",
    isAdminOrOwner: true,
    canCreateRooms: true,
    isGuest: false,
  },
  {
    key: "full-admin",
    userType: "admin",
    isAdminOrOwner: true,
    canCreateRooms: true,
    isGuest: false,
  },
  {
    // Rooms are theirs to create, but the portal's settings and plan are not.
    key: "room-admin",
    userType: "roomAdmin",
    isAdminOrOwner: false,
    canCreateRooms: true,
    isGuest: false,
  },
  {
    key: "user",
    userType: "regular",
    isAdminOrOwner: false,
    canCreateRooms: false,
    isGuest: false,
  },
  {
    // Cannot create or upload anywhere, and holds no AI-capable role.
    key: "guest",
    userType: "visitor",
    isAdminOrOwner: false,
    canCreateRooms: false,
    isGuest: true,
  },
];

/**
 * What the portal is paid for, which is a different question per edition.
 *
 * SaaS is on Startup until it is paid for and on Business after. A standalone
 * portal instead runs in one of three editions, told apart by its tariff:
 * Community is the licence-free open-source build, Enterprise is licensed, and
 * Developer is Enterprise plus the developer flag.
 */
type Plan = {
  key: string;
  title: string;
  /** True once the portal is paid for — the plan reads Business, not Startup. */
  isPaid: boolean;
  /** The /portal/tariff answer, which carries the edition flags. */
  tariff: () => ReturnType<typeof tariffHandler>;
  /** `quota.free` is the flag `currentQuotaStore.isFreeTariff` reads. */
  quota: () => ReturnType<typeof quotaHandler>;
};

const SAAS_PLANS: Plan[] = [
  {
    key: "paid",
    title: "paid",
    isPaid: true,
    tariff: () => tariffHandler(TEST_PORT),
    quota: () => quotaHandler(TEST_PORT),
  },
  {
    key: "free",
    title: "unpaid",
    isPaid: false,
    tariff: () => tariffHandler(TEST_PORT),
    quota: () => freeQuotaHandler(TEST_PORT),
  },
];

const STANDALONE_PLANS: Plan[] = [
  {
    // No licence: the open-source build, which sits on the free plan.
    key: "community",
    title: "Community",
    isPaid: false,
    tariff: () => tariffHandler(TEST_PORT, true),
    quota: () => freeQuotaHandler(TEST_PORT),
  },
  {
    key: "enterprise",
    title: "Enterprise",
    isPaid: true,
    tariff: () => tariffHandler(TEST_PORT, false, false, true),
    quota: () => quotaHandler(TEST_PORT),
  },
  {
    // Enterprise plus the developer flag (`isDeveloper` is `isEnterprise &&
    // developer`), which is what the payments page words itself from.
    key: "developer",
    title: "Developer",
    isPaid: true,
    tariff: () => tariffHandler(TEST_PORT, false, false, true, true),
    quota: () => quotaHandler(TEST_PORT),
  },
];

type Edition = {
  key: string;
  title: string;
  standalone: boolean;
  /**
   * The /settings preset, which is where `standalone` lives. The portal
   * switches this file flips - AI services, Developer Tools access - are
   * patched onto it per case rather than presetted, since they are orthogonal
   * to the edition and to each other.
   */
  settings: TypeSettings;
  /** The plans this edition can be on — see `Plan`. */
  plans: Plan[];
};

const EDITIONS: Edition[] = [
  {
    key: "saas",
    title: "SaaS",
    standalone: false,
    settings: TypeSettings.AuthenticatedNoStandalone,
    plans: SAAS_PLANS,
  },
  {
    key: "standalone",
    title: "standalone",
    standalone: true,
    settings: TypeSettings.Authenticated,
    plans: STANDALONE_PLANS,
  },
];

/**
 * The widths the page is pinned at.
 *
 * Not arbitrary sizes: the apps grid re-flows on container queries over
 * `dashboard-content` (Dashboard.module.scss), and the page reads the window
 * width itself to decide it is on a phone (`getDeviceTypeByWidth`: mobile up to
 * 600px, tablet up to 1023px). One width per shape the grid takes.
 */
type Viewport = {
  key: string;
  title: string;
  size: { width: number; height: number };
  /** Columns the apps grid lays out at this width. */
  columns: number;
  /**
   * Whether the sidebar is on screen. A phone hides it behind the burger, so
   * the catalog assertions have nothing to look at there.
   */
  withSidebar: boolean;
  /**
   * Whether the apps grid needs a frame of its own.
   *
   * The page scrolls inside its own container rather than the document, so a
   * screenshot only ever holds one viewport of it - and on a phone the apps
   * section is below that. Where it is, the case takes a second frame scrolled
   * down to it, so the layout this block is about is actually pinned.
   */
  withAppsFrame: boolean;
};

const DESKTOP: Viewport = {
  key: "desktop",
  title: "desktop",
  // Playwright's own viewport (playwright.config.ts), so the default matrix
  // does not have to resize at all.
  size: { width: 1440, height: 1024 },
  columns: 4,
  withSidebar: true,
  withAppsFrame: false,
};

const NARROW_VIEWPORTS: Viewport[] = [
  {
    key: "tablet",
    title: "tablet",
    size: { width: 900, height: 1024 },
    columns: 2,
    withSidebar: true,
    withAppsFrame: false,
  },
  {
    key: "mobile",
    title: "mobile",
    // Under 460px of content, which is where the grid drops to a single column
    // - and under 600px of window, which is what puts the page in its phone
    // layout (no tour buttons, sidebar behind the burger).
    size: { width: 390, height: 844 },
    columns: 1,
    withSidebar: false,
    withAppsFrame: true,
  },
];

type AiState = {
  key: string;
  title: string;
  enabled: boolean;
};

const AI_STATES: AiState[] = [
  { key: "on", title: "AI on", enabled: true },
  {
    // Both halves of "off": the portal-wide switch in the settings the client
    // reads `aiServicesEnabled` from, and /ai/config answering that nothing is
    // set up — which is what agent creation asks about.
    key: "off",
    title: "AI off",
    enabled: false,
  },
];

/**
 * Lands on the Overview as a user who has been there before.
 *
 * The welcome modal is offered once per user and would otherwise cover the page
 * in every one of these cases; it is spent up front by writing the flag the
 * store reads, under the id of whoever this case signs in as (a guessed id
 * writes a flag nobody reads, which shows up as a modal that will not go away).
 * The modal itself is covered by dashboard-tour.spec.ts.
 */
const openDashboard = async (
  page: Page,
  baseUrl: string,
  userId: string,
  viewport: Viewport,
) => {
  await page.setViewportSize(viewport.size);
  await page.clock.setSystemTime(FIXED_NOW);
  await page.addInitScript((key: string) => {
    window.localStorage.setItem(key, "true");
  }, welcomeKey(userId));

  await page.goto(`${baseUrl}${DASHBOARD_URL}`);

  // Past the loader: everything below is decided by stores that are still
  // loading while the skeleton is up.
  await expect(page.locator(CREATE_SECTION)).toBeVisible();
};

/**
 * Reads the apps grid back as rows of rendered boxes.
 *
 * The layout is decided by container queries and by how many cards there are,
 * so the rows are measured rather than assumed - grouping by the top edge is
 * what tells a wrapped row from a wide one.
 */
const readAppRows = async (page: Page) => {
  const boxes = await page.locator(APP_CARDS).evaluateAll((nodes) =>
    nodes.map((node) => {
      const { x, y, width } = node.getBoundingClientRect();
      return { x, y, width };
    }),
  );

  const rows = new Map<number, { x: number; width: number }[]>();
  boxes.forEach(({ x, y, width }) => {
    const top = Math.round(y);
    rows.set(top, [...(rows.get(top) ?? []), { x, width }]);
  });

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row.sort((a, b) => a.x - b.x));
};

/**
 * Every row of the apps grid spans the section edge to edge, and the cards in
 * it are equally wide - three apps fill the row exactly as four do, the way the
 * quick actions above them lay out. Geometric rather than a screenshot check,
 * so it holds on a local run too.
 */
const expectFilledRows = async (page: Page, columns: number) => {
  const sectionBox = await page.locator(APPS_SECTION).boundingBox();
  expect(sectionBox).not.toBeNull();

  const rows = await readAppRows(page);
  expect(rows.length).toBeGreaterThan(0);

  rows.forEach((row) => {
    expect(row.length).toBeLessThanOrEqual(columns);

    const first = row[0];
    const last = row[row.length - 1];

    // Left edge of the row against the section, right edge of the row against
    // the section: between them the row covers the whole width.
    expect(Math.abs(first.x - sectionBox!.x)).toBeLessThan(2);
    expect(
      Math.abs(last.x + last.width - (sectionBox!.x + sectionBox!.width)),
    ).toBeLessThan(2);

    // Equal columns, so no card is left carrying the slack.
    row.forEach(({ width }) => {
      expect(Math.abs(width - first.width)).toBeLessThan(2);
    });
  });
};

/**
 * One case of the matrix: a portal, a plan, an AI state, a Developer Tools
 * access rule and whoever is signed in.
 */
type DashboardCase = {
  role: Role;
  edition: Edition;
  plan: Plan;
  ai: AiState;
  /**
   * Developer Tools limited to the owner and full admins (Settings -> Security
   * -> Workspace access, where the "Disabled" radio means exactly this). The
   * portal answers /settings with `limitedAccessDevToolsForUsers`.
   */
  devToolsLimited: boolean;
  /** The width the page is rendered at. */
  viewport: Viewport;
  /**
   * Whether this case pins a reference screenshot on top of its assertions.
   *
   * Off where the case is known to render exactly like one that is already
   * pinned - a second baseline of the same frame costs a file and a
   * regeneration on every unrelated change, and signals nothing.
   */
  withScreenshot: boolean;
  /**
   * File name of this case's reference screenshot. It is filed under the
   * viewport's own folder, so the same name at two widths does not collide.
   */
  screenshot: string;
};

/**
 * Registers one case: mocks the portal it describes, lands on the Overview and
 * pins both the elements that case is about and the whole page.
 */
const dashboardCase = (name: string, testCase: DashboardCase) => {
  const {
    role,
    edition,
    plan,
    ai,
    devToolsLimited,
    viewport,
    withScreenshot,
    screenshot,
  } = testCase;

  // Who may open Developer Tools, which is the rule the section's own card and
  // the integrations card that advertises Docs Connect both follow: guests
  // never, and everyone below a full admin only while the portal does not
  // limit the section.
  const canOpenDevTools =
    !role.isGuest && (!devToolsLimited || role.isAdminOrOwner);

  test(name, async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, edition.settings, {
        ...(ai.enabled ? {} : { aiEnabled: false }),
        ...(devToolsLimited ? { limitedAccessDevToolsForUsers: true } : {}),
      }),
      selfByTypeHandler(TEST_PORT, role.userType),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      plan.tariff(),
      plan.quota(),
      aiConfigHandler(TEST_PORT, !ai.enabled),
    );

    await openDashboard(page, baseUrl, usersByType[role.userType].id, viewport);

    // The details on the card are the reader's own, so every audience gets it -
    // only the pencil that renames the workspace is admin/owner-only, since
    // renaming happens in portal settings.
    await expect(page.locator(PROFILE_CARD)).toHaveCount(1);
    await expect(page.locator(PROFILE_RENAME_BUTTON)).toHaveCount(
      role.isAdminOrOwner ? 1 : 0,
    );

    // The plan line is the admin/owner-only part of the header, and it names
    // the plan the portal is actually on. Startup and Business are SaaS
    // tariffs, so a standalone portal - which is paid for with a license and
    // has no payments page to send anyone to - has no plan line at all,
    // whoever is signed in.
    if (role.isAdminOrOwner && !edition.standalone) {
      await expect(planLine(page)).toBeVisible();
      await expect(planLine(page)).toContainText(
        plan.isPaid ? "Business" : "Startup",
      );
    } else {
      await expect(planLine(page)).toHaveCount(0);
    }

    // Developer Tools, and the integrations card that advertises Docs Connect
    // inside it, appear together - the second asks the same question as the
    // first. Docs Connect is SaaS-only on top of that, whoever is asking, and
    // the "or connect Docs" link is stricter still: it opens the page itself,
    // so admins and the owner only.
    await expect(page.locator(DEVTOOLS_CARD)).toHaveCount(
      canOpenDevTools ? 1 : 0,
    );
    await expect(page.locator(INTEGRATIONS_CARD)).toHaveCount(
      !edition.standalone && canOpenDevTools ? 1 : 0,
    );
    await expect(page.getByText(/or connect Docs/)).toHaveCount(
      !edition.standalone && role.isAdminOrOwner ? 1 : 0,
    );

    // The chat is hidden rather than disabled where it cannot be held: a portal
    // with AI services off has no chat to open, and a guest may never issue an
    // AI call at all.
    await expect(
      page.getByRole("button", { name: "AI Chat", exact: true }),
    ).toHaveCount(ai.enabled && !role.isGuest ? 1 : 0);

    // A portal with AI switched off has no agents to open either, so the app is
    // dropped from both the dashboard and the sidebar catalog rather than left
    // pointing at a dead end. With AI on it is there for everyone, and only its
    // button is worded by the create right.
    if (viewport.withSidebar)
      await expect(sidebarAgentsItem(page)).toHaveCount(ai.enabled ? 1 : 0);

    if (ai.enabled) {
      await expect(page.locator(AGENTS_CARD_BUTTON)).toHaveText(
        role.canCreateRooms ? "Create AI agent" : "Open",
      );
    } else {
      await expect(page.locator(AGENTS_CARD_BUTTON)).toHaveCount(0);
    }

    await expect(page.locator(APP_CARDS)).toHaveCount(ai.enabled ? 4 : 3);
    await expectFilledRows(page, viewport.columns);

    if (!withScreenshot) return;

    const shotPath = ["desktop", "dashboard", viewport.key];

    await expectScreenshot(page, [...shotPath, screenshot]);

    if (viewport.withAppsFrame) {
      await page.locator(APPS_SECTION).scrollIntoViewIfNeeded();
      await expectScreenshot(page, [
        ...shotPath,
        screenshot.replace(".png", "-apps.png"),
      ]);
    }
  });
};

/**
 * The page at the two widths where the apps grid changes shape.
 *
 * A block of its own rather than another axis of the matrix: what a narrower
 * window changes - the grid re-flowing, the sidebar going behind the burger,
 * the tour buttons dropping out on a phone - is the same for every audience and
 * for every plan. What does interact with it is how many cards there are, since
 * that is what decides whether a row is full, so both AI states are covered;
 * the owner stands in for the audiences because their page carries every
 * section, and the guest for the narrowest one, whose page carries the fewest.
 */
for (const viewport of NARROW_VIEWPORTS) {
  test.describe(`Dashboard on ${viewport.title}`, () => {
    for (const ai of AI_STATES) {
      for (const role of [ROLES[0], ROLES[4]]) {
        dashboardCase(`${role.key}, ${ai.title}`, {
          role,
          edition: EDITIONS[0],
          plan: SAAS_PLANS[0],
          ai,
          devToolsLimited: false,
          viewport,
          withScreenshot: true,
          screenshot: `ai-${ai.key}-${role.key}.png`,
        });
      }
    }
  });
}

for (const edition of EDITIONS) {
  test.describe(`Dashboard on a ${edition.title} portal`, () => {
    for (const plan of edition.plans) {
      test.describe(plan.title, () => {
        for (const ai of AI_STATES) {
          for (const role of ROLES) {
            dashboardCase(`${role.key}, ${ai.title}`, {
              role,
              edition,
              plan,
              ai,
              devToolsLimited: false,
              viewport: DESKTOP,
              // Developer is Enterprise plus a flag this page never reads, so
              // its frames are the Enterprise ones pixel for pixel. One of them
              // is kept as a canary - the day the page starts telling the two
              // apart, it fails and the rest of the audience gets its own
              // baselines then. The assertions above run for every case either
              // way.
              withScreenshot:
                plan.key !== "developer" || (ai.enabled && role === ROLES[0]),
              screenshot: `${edition.key}-${plan.key}-ai-${ai.key}-${role.key}.png`,
            });
          }
        }
      });
    }
  });

  /**
   * The portal's "Developer Tools section" switch set to Disabled, which limits
   * the section to the owner and full admins.
   *
   * A dimension of its own rather than another axis of the matrix above: what
   * it changes - the Developer Tools card, the integrations card and the
   * sidebar's Developer Tools button - is decided by the reader's role alone,
   * and does not interact with the plan or with the AI switch. So it is covered
   * across every audience on a paid portal with AI on, and the matrix above is
   * left to cover the rest.
   */
  test.describe(`Dashboard on a ${edition.title} portal with Developer Tools limited to admins`, () => {
    for (const role of ROLES) {
      dashboardCase(role.key, {
        role,
        edition,
        plan: edition.plans[0],
        ai: AI_STATES[0],
        devToolsLimited: true,
        viewport: DESKTOP,
        withScreenshot: true,
        screenshot: `${edition.key}-devtools-limited-${role.key}.png`,
      });
    }
  });
}
