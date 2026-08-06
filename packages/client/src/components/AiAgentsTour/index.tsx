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

import { useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  DeviceType,
  RoomsType,
  ShareAccessRights,
} from "@docspace/shared/enums";
import { useStores } from "@docspace/ui-kit/ai-agent/providers";

import type AiAgentsTourStore from "SRC_DIR/store/AiAgentsTourStore";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { TAIConfig } from "@docspace/shared/api/ai/types";
import type { Nullable } from "@docspace/shared/types";
import useTour, {
  type TourStepCallbacks,
} from "SRC_DIR/components/Tour/useTour";
import usePendingTour from "SRC_DIR/components/Tour/usePendingTour";
import {
  getTourAudience,
  type TourAudience,
} from "SRC_DIR/components/Tour/audience";
import { tourDemo } from "SRC_DIR/api/tourDemo";

import type { TCreatedBy } from "@docspace/shared/types";

import { getTourSteps, type TourStepFlags } from "./tourSteps";

type AiAgentsTourProps = {
  aiAgentsTourStore: AiAgentsTourStore;
  filesStore: FilesStore;
  infoPanelStore: InfoPanelStore;
  settingsStore: SettingsStore;
  user: UserStore["user"];
  userId?: string;
  audience: TourAudience;
  currentDeviceType: DeviceType;
  isFrame: boolean;
  firstLoad: boolean;
  isSectionLoading: boolean;
  isAiAgentsRoot: boolean;
  canCreateRooms: boolean;
  aiConfig: Nullable<TAIConfig>;
  isPortalAdmin: boolean;
  canActivateAi: boolean;
  showFilter: boolean;
  hasItems: boolean;
  aiAgentsId: string | null;
  hasRecent: boolean;
  hasFavorites: boolean;
  hasTrash: boolean;
};

/** What the member step took over, so its `restore` can hand it all back. */
type InfoPanelState = {
  selection: ReturnType<FilesStore["getSelection"]>;
  bufferSelection: FilesStore["bufferSelection"];
  view: InfoPanelStore["roomsView"];
  isVisible: boolean;
};

/**
 * The AI config a portal that has never loaded one is given while the tour
 * runs, so the section can be shown switched on.
 *
 * Only `aiReady` is claimed. Everything else is left at the emptiest value its
 * type allows rather than invented: the fields name the tools an agent's chat
 * is wired to, and the tour never opens a chat — a made-up tool name would be a
 * lie with somewhere to leak to, where an empty one is plainly nothing.
 */
const DEMO_AI_CONFIG: TAIConfig = {
  vectorizationEnabled: false,
  webSearchEnabled: false,
  knowledgeSearchToolName: "",
  webSearchToolName: "",
  webCrawlingToolName: "",
  aiReady: true,
  embeddingModel: "",
  portalMcpServerId: "",
  modelAliases: {},
};

const AiAgentsTour = ({
  aiAgentsTourStore,
  filesStore,
  infoPanelStore,
  settingsStore,
  user,
  userId,
  audience,
  currentDeviceType,
  isFrame,
  firstLoad,
  isSectionLoading,
  isAiAgentsRoot,
  canCreateRooms,
  aiConfig,
  isPortalAdmin,
  canActivateAi,
  showFilter,
  hasItems,
  aiAgentsId,
  hasRecent,
  hasFavorites,
  hasTrash,
}: AiAgentsTourProps) => {
  const { t } = useTranslation(["AiAgentsTour", "Common"]);
  const isMobileView = currentDeviceType === DeviceType.mobile;
  const isDesktop = currentDeviceType === DeviceType.desktop;

  // Agent creation gating mirrors Home: AI must be ready (or chat-lib profiles
  // already loaded, which can lead the portal /ai/config flag) and the user
  // able to manage agents. `useStores` is safe here — this host renders inside
  // Home, under the AiAgentProviders that also back the section itself.
  const { useProfilesStore } = useStores();
  const hasAiProfiles = useProfilesStore((s) => s.profiles.length > 0);
  const canCreate = (!!aiConfig?.aiReady || hasAiProfiles) && canCreateRooms;

  /**
   * The AI config as the portal itself has it, kept aside while the tour tells
   * the section AI is switched on.
   *
   * `undefined` means nothing is borrowed; `null` is a real value to hand back
   * (the config never loaded), which is why the two are distinguished.
   */
  const borrowedAiConfig = useRef<Nullable<TAIConfig> | undefined>(undefined);

  /**
   * Whether AI is really on for this portal, behind whatever the tour is
   * currently claiming. The closing step is the one thing that has to know:
   * it runs after the pretence is dropped, pointing at whichever button the
   * empty screen puts up for the portal's own state.
   */
  const realAiReady =
    borrowedAiConfig.current !== undefined
      ? !!borrowedAiConfig.current?.aiReady
      : !!aiConfig?.aiReady;

  /**
   * Stands in for the AI config, so a portal that has not switched AI on still
   * gets the tour rather than two steps of it.
   *
   * Without this the section is not merely empty, it is inert: the creation
   * banner, the filter bar and the agent list are all behind `aiReady`, so
   * everything the tour has to say about agents has nowhere to point. Nothing
   * is unlocked by the claim — react-joyride blocks every click while it runs,
   * its own spotlight included — and it is dropped again before the closing
   * step, which is what leaves the user looking at the real activation button.
   */
  const standInForAi = useCallback(() => {
    if (borrowedAiConfig.current !== undefined) return;

    borrowedAiConfig.current = settingsStore.aiConfig;

    settingsStore.setAIConfig({
      ...(settingsStore.aiConfig ?? DEMO_AI_CONFIG),
      aiReady: true,
      // A portal mid-reset is offered nothing to create with either, so the
      // stand-in has to answer this one as well.
      aiReadyNeedReset: false,
    });
  }, [settingsStore]);

  /** Hands the portal's own AI config back. A no-op if none was borrowed. */
  const restoreAi = useCallback(() => {
    const previous = borrowedAiConfig.current;
    if (previous === undefined) return;
    borrowedAiConfig.current = undefined;

    settingsStore.setAIConfig(previous);
  }, [settingsStore]);

  // The info panel is a piece of the user's own workspace, not the tour's, so
  // the step that borrows it records everything it overwrites first.
  const borrowedPanel = useRef<InfoPanelState | null>(null);

  const openInfoPanel = useCallback(() => {
    const agent = filesStore.filesList?.[0];
    if (!agent || borrowedPanel.current) return;

    borrowedPanel.current = {
      selection: filesStore.getSelection(),
      bufferSelection: filesStore.bufferSelection,
      view: infoPanelStore.roomsView,
      isVisible: infoPanelStore.isVisible,
    };

    // Selecting the agent is what points the panel at it —
    // `infoPanelSelection` reads the file list's selection, it has no setter of
    // its own. An agent is a room as far as the panel is concerned, so the
    // members tab is the one it opens.
    filesStore.setSelection([agent]);
    infoPanelStore.openMembersTab();
  }, [filesStore, infoPanelStore]);

  const closeInfoPanel = useCallback(() => {
    const previous = borrowedPanel.current;
    if (!previous) return;
    borrowedPanel.current = null;

    filesStore.setSelection(previous.selection);
    filesStore.setBufferSelection(previous.bufferSelection);
    infoPanelStore.setView(previous.view);
    infoPanelStore.setIsVisible(previous.isVisible);
  }, [filesStore, infoPanelStore]);

  const infoPanelHooks = useMemo(
    () => ({ reveal: openInfoPanel, restore: closeInfoPanel }),
    [openInfoPanel, closeInfoPanel],
  );

  // The section's own filter is passed back rather than left to default: it is
  // what carries `searchArea=AiAgents` and whatever sort the user is on.
  const reloadSection = useCallback(
    () => filesStore.fetchAgents(null, filesStore.roomsFilter, true, true),
    [filesStore],
  );

  // Hands the section back: the mocks come down, the portal's own AI config
  // with them, and the real (empty) list is fetched again — which is what puts
  // the empty screen up. The closing step does this on purpose, to point at
  // whichever button lives there.
  //
  // The AI config goes back before the reload, not after: it is what the empty
  // screen reads to decide whether to offer "create an agent" or "switch AI
  // on", and the closing step is pointing at the answer.
  const endDemo = useCallback(() => {
    if (!tourDemo.isActive) return;
    tourDemo.deactivate();
    restoreAi();
    void reloadSection();
  }, [restoreAi, reloadSection]);

  const demoHooks = useMemo(
    // Nothing to restore afterwards: the section is already the user's own
    // again by the time this step is done with it.
    () => ({ reveal: endDemo, restore: () => {} }),
    [endDemo],
  );

  // A portal with no agents of its own shows a tour reduced to its sidebar
  // step, so the section is stood in for while the tour runs. Armed on the
  // pending request, before `usePendingTour` starts anything: the reload has to
  // have landed by the time joyride freezes the step list against the DOM.
  useEffect(() => {
    if (!aiAgentsTourStore.isPending || aiAgentsTourStore.isRunning) return;
    if (tourDemo.isActive || hasItems) return;
    if (isMobileView || firstLoad || isSectionLoading || !isAiAgentsRoot)
      return;
    if (!user) return;

    // Whatever the audience. Somebody who cannot create an agent has the most
    // to gain from this and the least without it: their empty section renders
    // neither the banner nor the filter bar, so their tour is one sidebar step
    // — nothing about what an agent row does, and nothing about the member list
    // that says who else uses it. The closing step is what keeps that honest:
    // it names the empty list for anyone with no button on that screen.

    // Before the list, because the list is downstream of it: with AI off the
    // section renders neither the banner nor the filter bar, and the reload
    // would land on a page that has nowhere to put the stand-in agents.
    standInForAi();

    tourDemo.activate({
      // The agents list is the one thing this section does not share with
      // Rooms: it is answered by the AI service rather than by the files API.
      list: "agents",
      // The tour never opens an agent — the chat, the knowledge base and the
      // results all live behind a route of their own, and every one of them
      // would have to be invented — so the stand-in list is the whole of what
      // it borrows, and only ever when the real one came back empty.
      standInForList: true,
      // Three jobs anybody recognizes as work an agent can take over, so the
      // list reads as what the section is for at a glance. Unlike the rooms
      // tour — where each room is named after its own type and the names
      // already exist — an agent is named after its job, so these are the
      // tour's own strings.
      rooms: [
        {
          roomType: RoomsType.AIRoom,
          title: t("AiAgentsTour:AgentDemoSupport"),
        },
        {
          roomType: RoomsType.AIRoom,
          title: t("AiAgentsTour:AgentDemoOnboarding"),
        },
        {
          roomType: RoomsType.AIRoom,
          title: t("AiAgentsTour:AgentDemoContracts"),
        },
      ],
      owner: user as unknown as TCreatedBy,
      // What the access step is about: an agent is set up by one person and
      // used by several, some of whom only ever read what comes out of it.
      memberAccess: [ShareAccessRights.Editing, ShareAccessRights.ReadOnly],
    });

    void reloadSection();
  }, [
    aiAgentsTourStore.isPending,
    aiAgentsTourStore.isRunning,
    hasItems,
    isMobileView,
    firstLoad,
    isSectionLoading,
    isAiAgentsRoot,
    user,
    standInForAi,
    reloadSection,
    t,
  ]);

  // A tour that ends while a step is still up — closed, skipped, its anchor
  // gone — never reaches that step's `after`, so the panel would stay borrowed
  // and the stand-in agents would outlive the tour that put them there. Both
  // calls are no-ops when there is nothing to hand back.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (aiAgentsTourStore.isRunning) {
      hasStarted.current = true;
      return;
    }

    if (!hasStarted.current) return;
    hasStarted.current = false;

    closeInfoPanel();
    endDemo();
  }, [aiAgentsTourStore.isRunning, closeInfoPanel, endDemo]);

  // The effect above only fires while this component is around to see the tour
  // stop. Leaving the section takes it down instead — and both the interceptors
  // and the AI config are shared state, so they would outlive it: the first
  // would keep answering for a section the user has already walked away from,
  // and the second would leave the whole portal believing AI is on. Whatever
  // mounts next fetches its own list, so there is nothing to reload here.
  //
  // `restoreAiRef` keeps the current implementation reachable from a cleanup
  // that must run on unmount and on nothing else.
  const restoreAiRef = useRef(restoreAi);
  restoreAiRef.current = restoreAi;

  useEffect(
    () => () => {
      if (tourDemo.isActive) tourDemo.deactivate();
      restoreAiRef.current();
    },
    [],
  );

  /**
   * What the empty screen will offer once the pretence is dropped, which is
   * what the closing step points at and what it says.
   *
   * Mirrors EmptyViewContainer's own gate for `FolderType.AIAgents`: creation
   * for a portal admin with AI on, the way to switch it on for a portal admin
   * without it, and nothing at all for anybody else — including the admin of a
   * portal whose card is linked but who is not the payer, for whom activation
   * is somebody else's to do.
   */
  const emptyScreenAction: TourStepFlags["emptyScreenAction"] = !isPortalAdmin
    ? null
    : (realAiReady && "create") || (canActivateAi && "activate") || null;

  // Read in the render body rather than inside the memo: a value only `useMemo`
  // reads is a value `observer` does not track, so arming the demo would not
  // re-render the component — and a value missing from the deps is one a cached
  // memo never picks up even if it did. Here the demo is only ever armed on an
  // empty list, so the `hasItems` flip that the reload brings happens to
  // recompute this anyway; the dependency is spelled out so it does not have to.
  const isStandIn = tourDemo.isStandingInForList;

  const flags = useMemo<TourStepFlags>(
    () => ({
      audience,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      aiAgentsId,
      hasRecent,
      hasFavorites,
      hasTrash,
      infoPanelHooks,
      isStandIn,
      emptyScreenAction,
      demoHooks,
    }),
    [
      audience,
      isDesktop,
      canCreate,
      showFilter,
      hasItems,
      aiAgentsId,
      hasRecent,
      hasFavorites,
      hasTrash,
      infoPanelHooks,
      isStandIn,
      emptyScreenAction,
      demoHooks,
    ],
  );

  const buildSteps = useCallback(
    (callbacks: TourStepCallbacks) => getTourSteps(t, callbacks, flags),
    [t, flags],
  );

  const { Tour } = useTour(
    aiAgentsTourStore,
    buildSteps,
    isMobileView,
    "ai agents tour",
  );

  usePendingTour(
    aiAgentsTourStore,
    !firstLoad &&
      !isSectionLoading &&
      isAiAgentsRoot &&
      // With the section stood in for, "ready" also means the stand-in agents
      // have actually landed. Without this the reload above and the start timer
      // race, and joyride can freeze its step list against the empty page the
      // reload is on its way to replace.
      (!isStandIn || hasItems),
    isMobileView,
  );

  if (isFrame || !userId) return null;

  return Tour ? createPortal(Tour, document.body) : null;
};

export default inject(
  ({
    authStore,
    userStore,
    settingsStore,
    filesStore,
    infoPanelStore,
    treeFoldersStore,
    clientLoadingStore,
    publicRoomStore,
    paymentStore,
    aiAgentsTourStore,
  }: TStore) => {
    const {
      aiAgentsFolderId,
      recentFolderId,
      favoritesFolderId,
      recycleBinFolderId,
      isAIAgentsFolderRoot,
      isRoot,
    } = treeFoldersStore;

    const audience = getTourAudience(userStore?.user);

    return {
      aiAgentsTourStore,
      // The access step drives both of these directly: it selects an agent and
      // opens the panel on it, then puts each back the way it found it. The
      // list is also what the tour reloads when it hands the stand-in back.
      filesStore,
      infoPanelStore,
      // Borrowed the same way, for the length of the tour: with AI switched off
      // the section has nothing on it to point at.
      settingsStore,
      // The stand-in agents are owned by the user themselves — the less of the
      // section is invented, the less of it can be wrong.
      user: userStore?.user,
      userId: userStore?.user?.id,
      audience,
      currentDeviceType: settingsStore.currentDeviceType,
      isFrame: settingsStore.isFrame,
      firstLoad: clientLoadingStore.firstLoad,
      // Nothing in the section is behind a loader any more, so the anchors the
      // steps point at are the ones actually on screen.
      isSectionLoading: clientLoadingStore.showBodyLoader,
      isAiAgentsRoot:
        isAIAgentsFolderRoot && isRoot && !publicRoomStore.isPublicRoom,
      canCreateRooms: audience === "admin",
      // Read whole rather than as a boolean: the tour borrows this object for
      // the length of a run, and has to be able to give back what it found.
      aiConfig: settingsStore.aiConfig,
      // The empty screen offers its agent actions to portal admins and to
      // nobody else — a narrower gate than the banner's, which room admins
      // clear too (EmptyViewContainer.helpers, FolderType.AIAgents).
      isPortalAdmin: authStore.isAdmin,
      // Whether that screen would offer a way to switch AI on. A standalone
      // portal is sent to connect a provider; a paid one to activate the
      // service — except when the card on file is somebody else's, where the
      // screen stays bare because the activation is not this admin's to make.
      canActivateAi:
        settingsStore.standalone ||
        !paymentStore.isCardLinkedToPortal ||
        paymentStore.isPayer,
      showFilter: !filesStore.isEmptyPage,
      hasItems: filesStore.filesList?.length > 0,
      // Sidebar anchor (ClientArticleSidebar → NavMenu data-item-id). The AI
      // Agents parent item id is the tree folder id.
      aiAgentsId: aiAgentsFolderId != null ? String(aiAgentsFolderId) : null,
      // The agents sub-items reuse the portal-wide aliases and are only
      // rendered when those folders exist, so mirror the sidebar's own gating.
      hasRecent: recentFolderId != null,
      hasFavorites: favoritesFolderId != null,
      hasTrash: recycleBinFolderId != null,
    };
  },
)(observer(AiAgentsTour));
