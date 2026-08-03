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

import { useAiChatStore } from "@docspace/ui-kit/ai-agent/providers/ai-chat-store";

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
 *
 * `enabled` lets views that don't host the AI Chat panel (contacts, profile,
 * settings, …) skip wiring the reactions while keeping the hook call
 * unconditional.
 *
 * Unlike the SDK port this lives in the client where the Info Panel is a MobX
 * store passed in by the caller, and closing it uses `setIsVisible(false)`
 * (there is no dedicated `close()`).
 */
export const usePanelExclusivity = (
  infoPanelStore: InfoPanelStore,
  enabled = true,
) => {
  const aiChatStore = useAiChatStore();

  React.useEffect(() => {
    if (!enabled || !infoPanelStore) return undefined;

    const disposers = [
      reaction(
        () => aiChatStore.isVisible,
        (visible) => {
          if (visible) infoPanelStore.setIsVisible(false);
        },
      ),
      reaction(
        () => infoPanelStore.isVisible,
        (visible) => {
          if (visible) aiChatStore.close();
        },
      ),
    ];
    return () => disposers.forEach((dispose) => dispose());
  }, [enabled, aiChatStore, infoPanelStore]);
};

export default usePanelExclusivity;
