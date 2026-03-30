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

"use client";

import React from "react";
import { observer } from "mobx-react";

import { FormsSection } from "@/types/forms";

import { useFormsListStore } from "../../_store/FormsListStore";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useFormsAiAgentStore } from "../../_store/FormsAiAgentStore";
import { useFormsDataContext } from "../../_context/FormsDataContext";
import FormsGrid from "../../_components/forms-grid";

const CompletedPage = () => {
  const formsListStore = useFormsListStore();
  const formsSettingsStore = useFormsSettingsStore();
  const { hasManagementAccess } = formsSettingsStore;
  const { editingFile, completedFolder, goBackToCompletedRoot } =
    useFormsNavigationStore();
  const aiStore = useFormsAiAgentStore();
  const { fetchSection, fetchMore, fetchSubfolder } = useFormsDataContext();

  const fetchSectionRef = React.useRef(fetchSection);
  fetchSectionRef.current = fetchSection;
  const aiStoreRef = React.useRef(aiStore);
  aiStoreRef.current = aiStore;
  React.useEffect(() => {
    if (completedFolder) return;
    fetchSectionRef.current(FormsSection.CompletedForms);

    if (hasManagementAccess) {
      aiStoreRef.current.setCurrentFolder(null);
    }
  }, [completedFolder, hasManagementAccess]);

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
    if (!completedFolder) return;

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
