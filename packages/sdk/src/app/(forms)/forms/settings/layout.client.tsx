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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";
import { LoaderWrapper } from "@docspace/ui-kit/components/loader-wrapper";
import { getRoomMembers } from "@docspace/shared/api/rooms";
import type { RoomMember } from "@docspace/shared/api/rooms/types";

import { SettingsSubSection } from "@/types/forms";
import {
  settingsSubSectionFromPathname,
  settingsSubSectionToPath,
} from "../../_utils/sectionFromPathname";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useFormsAiAgentStore } from "../../_store/FormsAiAgentStore";
import { useFormsTourStore } from "../../_store/FormsTourStore";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";
import { createMockRoomMembers } from "../../_utils/mockFormFiles";
import styles from "../../_components/settings/category/SettingsPanel.module.scss";

type SettingsMembersContextValue = {
  members: RoomMember[];
  fetchMembers: () => void;
};

const SettingsMembersContext =
  React.createContext<SettingsMembersContextValue | null>(null);

export function useSettingsMembers(): SettingsMembersContextValue {
  const ctx = React.useContext(SettingsMembersContext);
  if (!ctx)
    throw new Error("useSettingsMembers must be used within SettingsShell");
  return ctx;
}

type SettingsShellProps = {
  children: React.ReactNode;
};

const SettingsShell = ({ children }: SettingsShellProps) => {
  const { t } = useTranslation(["Common"]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { roomId } = useFormsSettingsStore();
  const aiStore = useFormsAiAgentStore();
  const tourStore = useFormsTourStore();
  const activeSubSection = settingsSubSectionFromPathname(pathname);

  const [selectedId, setSelectedId] = React.useState(activeSubSection);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setSelectedId(activeSubSection);
  }, [activeSubSection]);

  React.useEffect(() => {
    if (!isPending) {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }
  }, [isPending]);

  const [members, setMembers] = React.useState<RoomMember[]>(() =>
    tourStore.showMockItems ? createMockRoomMembers() : [],
  );

  const fetchMembers = React.useCallback(() => {
    if (!roomId || tourStore.showMockItems) return;

    getRoomMembers(roomId, {})
      .then((res) => {
        setMembers(res.items);

        // Sync agent members when access list changes
        if (aiStore.aiAgentEnabled) {
          aiStore.syncAllAgentMembers();
        }
      })
      .catch(() => {});
  }, [roomId, aiStore, tourStore.showMockItems]);

  React.useEffect(() => {
    if (!roomId || tourStore.showMockItems) return;

    const abortController = new AbortController();

    getRoomMembers(roomId, {}, abortController.signal)
      .then((res) => {
        setMembers(res.items);
      })
      .catch(() => {});

    return () => {
      abortController.abort();
    };
  }, [roomId, tourStore.showMockItems]);

  const membersCtx = React.useMemo(
    () => ({ members, fetchMembers }),
    [members, fetchMembers],
  );

  const wrappedContent = (
    <LoaderWrapper isLoading={isPending}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingTop: 16,
        }}
      >
        {children}
      </div>
    </LoaderWrapper>
  );

  const tabs: TTabItem[] = React.useMemo(
    () => [
      {
        id: SettingsSubSection.Billing,
        name: t("Common:Billing"),
        content: wrappedContent,
      },
      {
        id: SettingsSubSection.AiAgent,
        name: t("Common:AIAgent"),
        content: wrappedContent,
      },
      {
        id: SettingsSubSection.Access,
        name: t("Common:AccessSettings"),
        content: wrappedContent,
      },
      {
        id: SettingsSubSection.CollectData,
        name: t("Common:CollectData"),
        content: wrappedContent,
      },
    ],
    [t, wrappedContent],
  );

  const onSelect = React.useCallback(
    (tab: TTabItem) => {
      const sub = tab.id as SettingsSubSection;
      if (sub === selectedId) return;

      setSelectedId(sub);

      const params = new URLSearchParams();
      const rid = searchParams.get("roomId") ?? "";
      const lid = searchParams.get("libraryId") ?? "";
      if (rid) params.set("roomId", rid);
      if (lid) params.set("libraryId", lid);
      const qs = params.toString();
      startTransition(() => {
        router.replace(`${settingsSubSectionToPath(sub)}${qs ? `?${qs}` : ""}`);
      });
    },
    [selectedId, searchParams, router],
  );

  return (
    <SettingsMembersContext.Provider value={membersCtx}>
      <div
        data-tour="settings-container"
        className={styles.settingsShell}
        style={{ position: "relative" }}
      >
        <div
          data-tour="settings-spotlight"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 360,
            pointerEvents: "none",
          }}
        />
        <Tabs
          items={tabs}
          selectedItemId={selectedId}
          onSelect={onSelect}
          withoutStickyIntend
          withAnimation
        />
      </div>
    </SettingsMembersContext.Provider>
  );
};

export default observer(SettingsShell);

