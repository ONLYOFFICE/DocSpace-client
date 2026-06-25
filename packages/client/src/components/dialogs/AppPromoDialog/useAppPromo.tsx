// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { useTranslation } from "react-i18next";

import type { AppId } from "SRC_DIR/helpers/apps-catalog";

import AppPromoDialog from "./AppPromoDialog";
import { getAppPromoContent } from "./configs";

// One localStorage flag per app — "this user has already seen <app>'s promo".
const seenKey = (appId: AppId) => `app-promo-seen:${appId}`;

const hasSeen = (appId: AppId): boolean => {
  try {
    return localStorage.getItem(seenKey(appId)) === "true";
  } catch {
    // Private mode / storage disabled — fall back to always navigating.
    return true;
  }
};

const markSeen = (appId: AppId): void => {
  try {
    localStorage.setItem(seenKey(appId), "true");
  } catch {
    // No-op: a failed write just means the promo may show again.
  }
};

type UseAppPromo = {
  // Wrap any app-launch navigation. Returns true when it handled the click by
  // opening the promo (caller must NOT navigate); false when the user has
  // already seen it (caller proceeds with its own navigation).
  maybeShowPromo: (appId: AppId) => boolean;
  // Render once in the page tree — the promo modal itself.
  promoDialog: React.ReactElement | null;
};

/**
 * Drives the first-run "introduce this app" promo. Call `maybeShowPromo(appId)`
 * from every entry point that opens an app (dashboard card, sidebar item). On
 * the first click it shows the promo and returns true (intercepting the
 * navigation); the promo's "Open …" button persists the seen flag and runs the
 * navigation. The close icon / backdrop dismisses without navigating.
 *
 * @param navigate  Performs the actual navigation for `appId` once the promo is
 *                  confirmed (or immediately, if already seen).
 */
export const useAppPromo = (navigate: (appId: AppId) => void): UseAppPromo => {
  const { t } = useTranslation(["Common", "Settings"]);
  const [activeAppId, setActiveAppId] = React.useState<AppId | null>(null);

  const navigateRef = React.useRef(navigate);
  navigateRef.current = navigate;

  // Per-app promo content with all texts already localized.
  const promoContent = React.useMemo(() => getAppPromoContent(t), [t]);

  const maybeShowPromo = React.useCallback(
    (appId: AppId): boolean => {
      // No promo content for this app, or the user already saw it → let the
      // caller navigate normally.
      if (!promoContent[appId] || hasSeen(appId)) return false;
      setActiveAppId(appId);
      return true;
    },
    [promoContent],
  );

  const onClose = React.useCallback(() => {
    setActiveAppId(null);
  }, []);

  const onOpen = React.useCallback(() => {
    if (!activeAppId) return;
    markSeen(activeAppId);
    const appId = activeAppId;
    setActiveAppId(null);
    navigateRef.current(appId);
  }, [activeAppId]);

  const content = activeAppId ? promoContent[activeAppId] : undefined;

  const promoDialog = content ? (
    <AppPromoDialog
      visible
      content={content}
      onClose={onClose}
      onOpen={onOpen}
    />
  ) : null;

  return { maybeShowPromo, promoDialog };
};

export default useAppPromo;

