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

import { act, renderHook } from "@testing-library/react";
import { makeAutoObservable } from "mobx";
import { describe, expect, it, vi } from "vitest";

const chat = vi.hoisted(() => ({ store: null as unknown }));

vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/ai-chat-store", () => ({
  useAiChatStore: () => chat.store,
}));
vi.mock("@onlyoffice/apps-ui-kit/ai-agent/providers/availability", () => ({
  useIsAiChatAvailable: () => true,
}));

import type InfoPanelStore from "SRC_DIR/store/InfoPanelStore";

import { usePanelExclusivity } from "../usePanelExclusivity";

const makeStores = () => {
  const aiChatStore = makeAutoObservable({
    isVisible: false,
    open() {
      this.isVisible = true;
    },
    close() {
      this.isVisible = false;
    },
  });
  const infoPanelStore = makeAutoObservable({
    isVisible: false,
    setIsVisible(visible: boolean) {
      this.isVisible = visible;
    },
  });
  chat.store = aiChatStore;
  return { aiChatStore, infoPanelStore };
};

const mount = (
  infoPanelStore: { isVisible: boolean },
  isChatInSection?: () => boolean,
) =>
  renderHook(() =>
    usePanelExclusivity(
      infoPanelStore as unknown as InfoPanelStore,
      isChatInSection,
    ),
  );

describe("usePanelExclusivity", () => {
  it("closes the Info panel when the side chat opens, and the chat when the Info panel opens", () => {
    const { aiChatStore, infoPanelStore } = makeStores();
    mount(infoPanelStore);

    act(() => infoPanelStore.setIsVisible(true));
    act(() => aiChatStore.open());
    expect(infoPanelStore.isVisible).toBe(false);

    act(() => infoPanelStore.setIsVisible(true));
    expect(aiChatStore.isVisible).toBe(false);
  });

  it("keeps the Info panel open on the way list -> agent -> list, whose chat is in the section body", () => {
    const { aiChatStore, infoPanelStore } = makeStores();
    let onAgentPage = false;
    mount(infoPanelStore, () => onAgentPage);

    act(() => infoPanelStore.setIsVisible(true));
    // The agent's page opens its chat.
    onAgentPage = true;
    act(() => aiChatStore.open());
    expect(infoPanelStore.isVisible).toBe(true);

    // Leaving the page releases the chat.
    onAgentPage = false;
    act(() => aiChatStore.close());
    expect(infoPanelStore.isVisible).toBe(true);
  });

  it("closes the Info panel of an agent's page once the chat opened from the sidebar is no longer the section's own", () => {
    const { aiChatStore, infoPanelStore } = makeStores();
    const page = makeAutoObservable({ isAgent: true });
    mount(infoPanelStore, () => page.isAgent);

    act(() => aiChatStore.open());
    act(() => infoPanelStore.setIsVisible(true));
    // AI Chat in the sidebar: the page releases its chat and the chat opens
    // again, fullscreen, while the agent is still the open room.
    act(() => aiChatStore.close());
    act(() => aiChatStore.open());
    expect(infoPanelStore.isVisible).toBe(true);

    act(() => {
      page.isAgent = false;
    });
    expect(infoPanelStore.isVisible).toBe(false);
    expect(aiChatStore.isVisible).toBe(true);
  });

  it("opens the Info panel beside the agent's chat without closing it", () => {
    const { aiChatStore, infoPanelStore } = makeStores();
    mount(infoPanelStore, () => true);

    act(() => aiChatStore.open());
    act(() => infoPanelStore.setIsVisible(true));
    expect(aiChatStore.isVisible).toBe(true);
    expect(infoPanelStore.isVisible).toBe(true);
  });
});
