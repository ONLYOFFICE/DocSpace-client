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

import { Suspense, lazy, useEffect, type ComponentType } from "react";
import { inject, observer } from "mobx-react";

import type TourStore from "SRC_DIR/store/TourStore";

/**
 * The four section tour hosts, behind one gate.
 *
 * They are loaded on demand rather than with the section, because of what they
 * pull in behind them: react-joyride, the step tables of every section, and the
 * demo (`SRC_DIR/api/tourDemo`) with its stand-in rooms, spaces and files. None
 * of that is worth the main chunk for a feature a user meets once — and the
 * demo in particular is a mechanism for answering API requests locally, which
 * has no business sitting in the bundle of a user who is not taking a tour.
 *
 * The gate is the stores, which are cheap and always present: a tour host only
 * ever does anything for a tour that has been requested (`isPending`, armed by
 * the app promo on the dashboard) or is already up (`isRunning`). Until then
 * every host renders `null`, so mounting them is the same as not — this just
 * makes that literal, and keeps the chunk off the wire while it holds.
 *
 * All four in one gate on purpose: whichever section is on screen, only that
 * section's host has a root to run in, and the request that opens the chunk is
 * what says which one that is.
 */

/**
 * Every host takes its props from the store through `inject`, so none is passed
 * one here. `inject` does not carry that through to the declared prop type,
 * which is why each import is read back as the zero-prop component it is in
 * practice — the same thing that let these be rendered bare from Home.
 */
const lazyTour = (load: () => Promise<{ default: unknown }>) =>
  lazy(load as Parameters<typeof lazy>[0]) as ComponentType<
    Record<string, never>
  >;

const FilesTour = lazyTour(() => import("SRC_DIR/components/FilesTour"));
const RoomsTour = lazyTour(() => import("SRC_DIR/components/RoomsTour"));
const FormsTour = lazyTour(() => import("SRC_DIR/components/FormsTour"));
const AiAgentsTour = lazyTour(() => import("SRC_DIR/components/AiAgentsTour"));

type SectionToursProps = {
  tourStores: TourStore[];
  isWanted: boolean;
};

const SectionTours = ({ tourStores, isWanted }: SectionToursProps) => {
  // The request is made on another route and survives a full page load through
  // storage, so something has to read it back — and that something cannot live
  // inside the chunk this flag decides whether to load. `usePendingTour` still
  // hydrates on its own once a host is up; both only ever raise the flag.
  useEffect(() => {
    tourStores.forEach((store) => store.hydratePending());
  }, [tourStores]);

  if (!isWanted) return null;

  // No fallback: a tour host renders into a portal and shows nothing of its own
  // until it starts, so there is nothing to stand in for while it loads. The
  // section it walks through is already on screen underneath.
  return (
    <Suspense fallback={null}>
      <FilesTour />
      <RoomsTour />
      <FormsTour />
      <AiAgentsTour />
    </Suspense>
  );
};

export default inject(
  ({
    filesTourStore,
    roomsTourStore,
    formsTourStore,
    aiAgentsTourStore,
  }: TStore) => {
    const tourStores = [
      filesTourStore,
      roomsTourStore,
      formsTourStore,
      aiAgentsTourStore,
    ];

    return {
      tourStores,
      isWanted: tourStores.some(
        (store) => store.isPending || store.isRunning,
      ),
    };
  },
)(observer(SectionTours));
