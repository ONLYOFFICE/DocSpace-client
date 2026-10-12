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

import { Suspense, lazy, useRef, type ComponentType } from "react";
import { inject, observer } from "mobx-react";

/**
 * The dashboard's tour, behind the same kind of gate as `SectionTours`.
 *
 * A gate of its own rather than a fifth entry in that one, because the two are
 * mounted on different routes: `SectionTours` renders inside Home, which is
 * where the four section tours run, and the dashboard is not part of it. What is
 * shared is the reasoning — react-joyride and a step table are not worth the
 * main chunk for something a user meets once — so the load waits until a tour has
 * actually been asked for.
 *
 * `inject` gives the host its own props, so none is passed here; the cast reads
 * the import back as the zero-prop component it is in practice.
 */
const DashboardTour = lazy(
  (() =>
    import("SRC_DIR/components/DashboardTour")) as Parameters<typeof lazy>[0],
) as ComponentType<Record<string, never>>;

type DashboardTourHostProps = {
  /** Supplied by `inject`; optional so the connected component takes no props. */
  isWanted?: boolean;
};

const DashboardTourHost = ({ isWanted = false }: DashboardTourHostProps) => {
  // Once up, it stays up for the life of the page. `isWanted` drops on the same
  // store change that ends the tour (`completeTour` clears both flags), so
  // releasing on it would unmount the host in the very commit that told it the
  // tour was over — and `useTour`'s cleanup would run in place of the effects
  // that tidy up after a run. Keeping it costs nothing: a host that is neither
  // pending nor running renders `null`, and the chunk is already loaded by then.
  const wasWanted = useRef(false);
  if (isWanted) wasWanted.current = true;

  if (!wasWanted.current) return null;

  // No fallback: the tour renders into a portal and shows nothing of its own
  // until it starts. The page it walks is already on screen underneath.
  return (
    <Suspense fallback={null}>
      <DashboardTour />
    </Suspense>
  );
};

const DashboardTourHostConnected = inject(
  ({ dashboardTourStore }: TStore) => ({
    isWanted: dashboardTourStore.isPending || dashboardTourStore.isRunning,
  }),
)(observer(DashboardTourHost));

export { DashboardTourHostConnected as DashboardTourHost };

export default DashboardTourHostConnected;
