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

// react-joyride's hooks keep state the React Compiler cannot follow — the same
// opt-out the section tours carry (see Tour/useTour.ts).
"use no memo";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Trans, useTranslation } from "react-i18next";
import {
  ACTIONS,
  EVENTS,
  SpotlightPadding,
  useJoyride,
  type Step,
} from "react-joyride";

import { useStores } from "@onlyoffice/ai-chat";

import { useLocalStorage } from "@docspace/shared/hooks/useLocalStorage";

import ModelUpdatedTooltip from "./ModelUpdatedTooltip";

// Frozen — the flag already lives in users' browsers once shown.
const DISMISSED_KEY = "ai_chat_model_updated_bar_dismissed";

// The composer's model picker: an interactive combo, or the read-only label
// shown to users who may not change the agent's model. joyride resolves this
// selector itself and waits `targetWaitTimeout` for it.
const ANCHOR_SELECTOR =
  '[data-testid="model-selector"],[data-testid="model-selector-readonly"]';

/**
 * How long joyride polls for the composer's picker before giving up on the
 * step (TARGET_NOT_FOUND).
 *
 * Twice its own default, because the notice can come due before the composer
 * is mounted — the assignments read resolves on its own schedule. Not more
 * than that: while joyride waits it dims the page (without the spotlight
 * cutout, which needs a target) and puts up a spinner after `loaderDelay`, so
 * this is also the worst case a user whose chat never opened has to sit
 * through.
 */
const TARGET_WAIT_TIMEOUT = 2000;

/**
 * Backdrop tint. Half of what the onboarding tours dim the page by (0.5): a
 * tour takes the page over for several steps, this is one notice the user can
 * click away, so the page behind it stays readable.
 */
const OVERLAY_COLOR = "rgba(0, 0, 0, 0.20)";

/** Breathing room between the spotlight cutout and the picker. */
const SPOTLIGHT_PADDING: SpotlightPadding = {
  right: 3,
  left: 6,
  top: 5,
  bottom: 5,
};

/**
 * Above the backdrop joyride paints, below the dropdown layer (400) — an
 * opened picker must cover the card, not the other way round.
 */
const Z_INDEX = 390;

type ModelUpdatedBannerProps = {
  /** Chat scope — the AI agent room the chat currently runs against. */
  entityId?: string;
  /** Only agent rooms are expected to carry a model assignment. */
  isAgentRoom?: boolean;
};

/**
 * Tells the user that the agent has no model assignment of its own (the
 * portal's available models changed) and that the chat now answers with the
 * automatically picked one.
 *
 * The marker is `GET /ai/assignments/get-all-assignments?entityId=...` coming
 * back empty — read off the chat library's profiles store rather than fetched
 * again: that store issues the very same request (on `init` and on every
 * re-scope through `reloadModelAssignment`) and files the map into its slots,
 * so an empty map leaves both `chatProfile` and `defaultProfile` null. Inside
 * an AI agent room an assignment is always expected, which is what makes the
 * empty map worth telling the user about.
 *
 * Rendered as a one-step react-joyride tour anchored to the composer's model
 * picker — the control the text sends the user to. joyride owns the portal
 * (`#react-joyride-portal`), the target wait and the Floating UI positioning;
 * everything that would make it a tour rather than a notice is switched off
 * here: no beacon, no scrolling, no focus trap (the user must be able to keep
 * typing in the composer) and a backdrop that leaves the picker in the clear.
 *
 * Dismissal is final — the flag is kept in localStorage, so a user who closes
 * the card never sees it again.
 */
const ModelUpdatedBanner = ({
  entityId,
  isAgentRoom,
}: ModelUpdatedBannerProps) => {
  const { t } = useTranslation("Common");

  const { useProfilesStore } = useStores();

  const isStoreReady = useProfilesStore((s) => s.initialized);
  // A portal with no models at all is a different story, told elsewhere (the
  // activation banner, the empty AI settings page) — this notice is about
  // models existing while the agent is bound to none of them.
  const hasProfiles = useProfilesStore((s) => s.profiles.length > 0);
  // The two slots the assignments map fills for this scope. Both empty is the
  // marker, and it covers an assignment pointing at a profile that no longer
  // exists just as well as the map itself coming back empty.
  const hasAssignment = useProfilesStore(
    (s) => !!s.chatProfile || !!s.defaultProfile,
  );
  // What the composer picker shows (the lib's own `selectCurrentChatProfile`):
  // the session pick wins, then the agent's Chat-action profile, then the
  // portal default. With nothing assigned the picker auto-selects the first
  // chat-capable profile into the session slot — that is the model this notice
  // reports as picked automatically.
  const modelName = useProfilesStore(
    (s) => (s.sessionChatProfile ?? s.chatProfile ?? s.defaultProfile)?.name,
  );

  const [isDismissed, setIsDismissed] = useLocalStorage<boolean>(
    DISMISSED_KEY,
    false,
  );

  // The picker never showed up within joyride's wait (the chat stayed closed).
  // Not a dismissal — nothing was shown — so it is kept out of localStorage and
  // the notice is offered again on the next visit.
  const [isTargetMissing, setIsTargetMissing] = useState(false);

  const isVisible =
    !isDismissed &&
    !isTargetMissing &&
    !!isAgentRoom &&
    !!entityId &&
    isStoreReady &&
    hasProfiles &&
    !hasAssignment &&
    !!modelName;

  const steps = useMemo<Step[]>(
    () => [
      {
        target: ANCHOR_SELECTOR,
        // "end" is logical, so the card shares the picker's trailing edge in
        // LTR and RTL alike; joyride re-places it when there is no room above.
        placement: "top-end",
        title: t("Common:AIModelUpdatedTitle"),
        content: (
          <Trans
            t={t}
            ns="Common"
            i18nKey="AIModelUpdatedDescription"
            values={{ model: modelName }}
            components={{ 1: <strong /> }}
          />
        ),
      },
    ],
    [t, modelName],
  );

  const { on, state, Tour } = useJoyride({
    steps,
    run: isVisible,
    tooltipComponent: ModelUpdatedTooltip,
    // A free-floating card, like the tour tooltips: no arrow toward the picker.
    floatingOptions: { hideArrow: true },
    options: {
      // Backdrop, with the model picker left in the clear: the text sends the
      // user to that control, so it stays lit and clickable through the
      // spotlight cutout while the rest of the page is dimmed. Lighter than a
      // tour's own backdrop — this interrupts nobody, it only points.
      overlayColor: OVERLAY_COLOR,
      spotlightPadding: SPOTLIGHT_PADDING,
      blockTargetInteraction: false,
      spotlightRadius: 12,
      // Any click beside the picker takes the notice away for good.
      overlayClickAction: "close",
      // Everything that would make this behave as a tour rather than a notice.
      skipBeacon: true,
      skipScroll: true,
      // The composer is right under the card — stealing focus into the card
      // would interrupt whoever is typing.
      disableFocusTrap: true,
      zIndex: Z_INDEX,
      width: 430,
      targetWaitTimeout: TARGET_WAIT_TIMEOUT,
    },
    locale: { close: t("Common:CloseButton") },
  });

  // The ×, Esc and a click on the backdrop all come through as joyride's CLOSE
  // action — the one signal that lands whatever the step's lifecycle. TOUR_END
  // is deliberately not treated as a dismissal: with a single step it also
  // fires when the target was never found, which nobody saw.
  useEffect(() => {
    if (!isVisible) return;
    if (state.action === ACTIONS.CLOSE) setIsDismissed(true);
  }, [state.action, isVisible, setIsDismissed]);

  useEffect(
    () => on(EVENTS.TARGET_NOT_FOUND, () => setIsTargetMissing(true)),
    [on],
  );

  return Tour ? createPortal(Tour, document.body) : null;
};

export { ModelUpdatedBanner };

export default ModelUpdatedBanner;

