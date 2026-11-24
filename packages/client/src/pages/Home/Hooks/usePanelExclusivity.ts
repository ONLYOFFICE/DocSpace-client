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

import React from "react";
import { reaction } from "mobx";

import { useAiChatStore } from "@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store";
import { useIsAiChatAvailable } from "@onlyoffice/apps-ui-kit/ai-agent/providers/availability";

import type InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

/**
 * Keeps the AI Chat panel and the Info Panel mutually exclusive: they share the
 * same right-side area, so opening one must close the other.
 *
 * The invariant is enforced in one place via reactions on each store's
 * `isVisible` transition, which covers every open path (context menu, header
 * toggle, section setVisible, AI trigger) without scattering close() calls
 * across call sites. Closing the other store flips its `isVisible` to false,
 * firing the sibling reaction with `false` — a guarded no-op, so no loop.
 * On mount the two are reconciled once, for changes made while Home was away.
 *
 * `enabled` lets views that don't host the AI Chat panel (contacts, profile,
 * settings, …) skip wiring the reactions while keeping the hook call
 * unconditional.
 *
 * Unlike the SDK port this lives in the client where the Info Panel is a MobX
 * store passed in by the caller, and closing it uses `setIsVisible(false)`
 * (there is no dedicated `close()`).
 *
 * An agent's page draws its chat in the section body, not in the side area,
 * so there the two do not compete (`isChatInSection`): opening the agent
 * leaves the Info panel as it was, as opening a room does, and the Info
 * panel opens beside the agent's chat.
 */
export const usePanelExclusivity = (
  infoPanelStore: InfoPanelStore,
  isChatInSection: () => boolean = () => false,
) => {
  const aiChatStore = useAiChatStore();

  // Handed over as a new function on every render: read through a ref, so
  // the reactions below are not set up again for it.
  const isChatInSectionRef = React.useRef(isChatInSection);
  isChatInSectionRef.current = isChatInSection;

  const isAiChatAvailable = useIsAiChatAvailable();

  React.useEffect(() => {
    if (!isAiChatAvailable && aiChatStore.isVisible) {
      aiChatStore.close();
    }
  }, [isAiChatAvailable, aiChatStore]);

  React.useEffect(() => {
    if (!infoPanelStore) return undefined;

    // The reactions below only see transitions made while Home is mounted. The
    // chat panel is shared state that can also be opened on the dashboard,
    // where the Info Panel keeps its last `isVisible` untouched; coming back
    // would then show both. The chat is the newer of the two, so it wins.
    if (
      aiChatStore.isVisible &&
      infoPanelStore.isVisible &&
      !isChatInSectionRef.current()
    ) {
      infoPanelStore.setIsVisible(false);
    }

    const disposers = [
      reaction(
        () => aiChatStore.isVisible,
        (visible) => {
          if (visible && !isChatInSectionRef.current())
            infoPanelStore.setIsVisible(false);
        },
      ),
      reaction(
        () => infoPanelStore.isVisible,
        (visible) => {
          if (visible && !isChatInSectionRef.current()) aiChatStore.close();
        },
      ),
      // The chat stops being the section's own with both on screen: AI Chat
      // or Recent clicked on an agent's page opens the chat fullscreen while
      // the agent is still the open room, so the reaction above let the Info
      // panel be, and it was left beside a chat that covers the section.
      // The chat is the newer of the two, so it wins here as well.
      reaction(
        () => isChatInSectionRef.current(),
        (inSection) => {
          if (!inSection && aiChatStore.isVisible && infoPanelStore.isVisible)
            infoPanelStore.setIsVisible(false);
        },
      ),
    ];
    return () => disposers.forEach((dispose) => dispose());
  }, [aiChatStore, infoPanelStore]);
};

export default usePanelExclusivity;
