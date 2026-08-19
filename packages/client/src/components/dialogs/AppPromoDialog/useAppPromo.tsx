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

import { useIsMobile } from "@docspace/ui-kit/hooks/use-is-mobile";

import type { AppId } from "SRC_DIR/helpers/apps-catalog";

import AppPromoDialog from "./AppPromoDialog";
import { getAppPromoContent } from "./configs";

type UseAppPromo = {
  // Wrap any app-launch navigation. Returns true when it handled the click by
  // opening the promo (caller must NOT navigate); false when the app has no
  // promo content at all (caller proceeds with its own navigation).
  maybeShowPromo: (appId: AppId) => boolean;
  // Render once in the page tree — the promo modal itself.
  promoDialog: React.ReactElement | null;
};

/**
 * Drives the "introduce this app" promo. Call `maybeShowPromo(appId)` from every
 * entry point that opens an app (dashboard card, sidebar item). It shows the
 * promo on every click — there is no "already seen" state — and returns true to
 * intercept the navigation; the promo's "Open …" button then runs it. The close
 * icon / backdrop dismisses without navigating. Apps with no promo content
 * return false so the caller navigates itself.
 *
 * @param navigate  Performs the actual navigation for `appId` once the promo is
 *                  confirmed.
 * @param requestTour  Arms `appId`'s onboarding tour, which its section starts
 *                  once it has loaded. Given one, the promo offers "Take a
 *                  tour" next to "Open …" for every app whose content carries a
 *                  `tourLabel`; left out (or on mobile, where no tour runs) the
 *                  button isn't shown at all.
 */
export const useAppPromo = (
  navigate: (appId: AppId) => void,
  requestTour?: (appId: AppId) => void,
): UseAppPromo => {
  const { t } = useTranslation(["Common", "Settings"]);
  const [activeAppId, setActiveAppId] = React.useState<AppId | null>(null);
  const isMobile = useIsMobile();

  const navigateRef = React.useRef(navigate);
  navigateRef.current = navigate;

  const requestTourRef = React.useRef(requestTour);
  requestTourRef.current = requestTour;

  // Per-app promo content with all texts already localized.
  const promoContent = React.useMemo(() => getAppPromoContent(t), [t]);

  const maybeShowPromo = React.useCallback(
    (appId: AppId): boolean => {
      // No promo content for this app → let the caller navigate normally.
      if (!promoContent[appId]) return false;
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
    const appId = activeAppId;
    setActiveAppId(null);
    navigateRef.current(appId);
  }, [activeAppId]);

  // Same as "Open …", with the app's tour armed first: the section starts it
  // itself once it has loaded, so the request has to be in before we navigate.
  const onTakeTour = React.useCallback(() => {
    if (!activeAppId) return;
    const appId = activeAppId;
    setActiveAppId(null);
    requestTourRef.current?.(appId);
    navigateRef.current(appId);
  }, [activeAppId]);

  const content = activeAppId ? promoContent[activeAppId] : undefined;

  const promoDialog = content ? (
    <AppPromoDialog
      visible
      content={content}
      onClose={onClose}
      onOpen={onOpen}
      onTakeTour={requestTour && !isMobile ? onTakeTour : undefined}
    />
  ) : null;

  return { maybeShowPromo, promoDialog };
};

export default useAppPromo;

