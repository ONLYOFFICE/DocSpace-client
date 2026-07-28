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
import { observer } from "mobx-react";

import { FormsSection } from "@/types/forms";

import { useFormsListStore } from "../../_store/FormsListStore";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useFormsAiAgentStore } from "../../_store/FormsAiAgentStore";
import { useFormsTourStore } from "../../_store/FormsTourStore";
import { useFormsDataContext } from "../../_context/FormsDataContext";
import FormsGrid from "../../_components/forms-grid";

const CompletedPage = () => {
  const formsListStore = useFormsListStore();
  const formsSettingsStore = useFormsSettingsStore();
  const { hasManagementAccess } = formsSettingsStore;
  const { editingFile, completedFolder, goBackToCompletedRoot } =
    useFormsNavigationStore();
  const aiStore = useFormsAiAgentStore();
  const tourStore = useFormsTourStore();
  const { fetchSection, fetchMore, fetchSubfolder } = useFormsDataContext();

  const fetchSectionRef = React.useRef(fetchSection);
  fetchSectionRef.current = fetchSection;
  const aiStoreRef = React.useRef(aiStore);
  aiStoreRef.current = aiStore;
  React.useEffect(() => {
    if (tourStore.showMockItems) return;
    if (completedFolder) return;

    const ssrHasData =
      formsListStore.section === FormsSection.CompletedForms &&
      !formsListStore.isLoading &&
      formsListStore.folders.length > 0;
    if (ssrHasData) return;

    fetchSectionRef.current(FormsSection.CompletedForms);
  }, [completedFolder, tourStore.showMockItems, formsListStore]);

  React.useEffect(() => {
    if (tourStore.showMockItems) return;
    if (completedFolder) return;
    if (hasManagementAccess) {
      aiStoreRef.current.setCurrentFolder(null);
    }
  }, [completedFolder, hasManagementAccess, tourStore.showMockItems]);

  React.useEffect(() => {
    if (!completedFolder || editingFile) return;

    const handlePopState = () => {
      history.pushState(null, "", window.location.href);
      goBackToCompletedRoot();
    };

    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [completedFolder, editingFile, goBackToCompletedRoot]);

  const fetchIdRef = React.useRef(0);
  React.useEffect(() => {
    if (!completedFolder || tourStore.showMockItems) return;

    const controller = new AbortController();
    const currentFetchId = ++fetchIdRef.current;

    (async () => {
      try {
        await fetchSubfolder(completedFolder.id, controller.signal);
        if (
          controller.signal.aborted ||
          currentFetchId !== fetchIdRef.current
        )
          return;

        if (hasManagementAccess) {
          await aiStore.setCurrentFolder(completedFolder.id);
          if (currentFetchId !== fetchIdRef.current) return;

          const files = formsListStore.items.map((f) => ({
            id: f.id,
            title: f.title,
          }));

          if (aiStore.aiAgentEnabled && !aiStore.currentAgentId) {
            aiStore.setPreparingAgent(true);
            try {
              const entry = await aiStore.createAgentForFolder(
                { id: completedFolder.id, title: completedFolder.title },
                files,
              );
              if (currentFetchId !== fetchIdRef.current) return;
              if (entry) {
                await aiStore.setCurrentFolder(completedFolder.id);
                if (currentFetchId !== fetchIdRef.current) return;
              }
            } finally {
              aiStore.setPreparingAgent(false);
            }
          }

          if (files.length > 0) {
            aiStore.syncCompletedForms(files);
          }
        }
      } catch {
      }
    })();

    return () => controller.abort();
  }, [completedFolder, fetchSubfolder, hasManagementAccess, aiStore, formsListStore]);

  return (
    <FormsGrid
      filesSettings={formsSettingsStore.filesSettings!}
      fetchMore={fetchMore}
    />
  );
};

export default observer(CompletedPage);
