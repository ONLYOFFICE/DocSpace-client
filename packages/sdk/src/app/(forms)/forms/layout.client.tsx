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
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import Section from "@docspace/ui-kit/components/section";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";
import { setAuthToken } from "@docspace/shared/api/client";

import useDeviceType from "@/hooks/useDeviceType";
import { useSDKConfig } from "@/providers/SDKConfigProvider";
import { FormsSection } from "@/types/forms";
import { sectionFromPathname, sectionToPath } from "../_utils/sectionFromPathname";
import { useFormsNavigationStore } from "../_store/FormsNavigationStore";
import { useFormsListStore } from "../_store/FormsListStore";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsUserStore } from "../_store/FormsUserStore";
import useInitCommonStores, { type CommonData } from "../_hooks/useInitCommonStores";
import useFormsData from "../_hooks/useFormsData";
import useFolderActions from "../_hooks/useFolderActions";
import useFormsSocket from "../_hooks/useFormsSocket";
import useFormEventHooks from "../_hooks/useFormEventHooks";
// useUrlSync removed — FormsEditor.handleFormCompleted handles navigation directly
import useEditorGuard from "../_hooks/useEditorGuard";
import { MIN_SECTION_WIDTH } from "../_api/aiAgentSettings";
import FormsSidebar from "../_components/sidebar";
import FormsEditor from "../_components/forms-editor";
import AiChatPanel from "../_components/ai-chat-panel";
import AiChatButton from "../_components/ai-chat-button";
import CreateFormDialog from "../_components/create-form-dialog";
import FormsHeader from "../_components/forms-header";
import MobileStub from "../_components/mobile-stub";
import styles from "../_components/forms-layout/FormsLayout.module.scss";

type FormsShellProps = {
  commonData: CommonData & { authToken: string };
  children: React.ReactNode;
};

const FormsShell = ({ commonData, children }: FormsShellProps) => {
  useSDKConfig();
  const isReady = useInitCommonStores(commonData);

  const {
    editingFile,
    closeEditor,
    completedFolder,
    inProgressFolder,
    goBackToCompletedRoot,
    goBackToInProgressRoot,
  } = useFormsNavigationStore();
  const aiStore = useFormsAiAgentStore();
  const { user } = useFormsUserStore();
  const formsSettingsStore = useFormsSettingsStore();
  const { roomId, socketUrl, hasManagementAccess } = formsSettingsStore;
  const formsListStore = useFormsListStore();
  const { items, folders, isLoading } = formsListStore;
  const { currentDeviceType } = useDeviceType();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);

  const authTokenSet = React.useRef(false);
  React.useEffect(() => {
    const token = commonData.authToken;
    if (token && !authTokenSet.current) {
      authTokenSet.current = true;
      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `asc_auth_key=${token}; path=/; SameSite=Lax${secure}`;
      setAuthToken(token);
    }
  }, [commonData.authToken]);

  const socketFolderIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (roomId) ids.add(String(roomId));
    if (completedFolder) ids.add(String(completedFolder.id));
    if (inProgressFolder) ids.add(String(inProgressFolder.id));
    if (aiStore.doneFolderId) ids.add(String(aiStore.doneFolderId));
    for (const key of Object.keys(aiStore.folderAgentsMap)) {
      ids.add(key);
    }
    return [...ids];
  }, [
    roomId,
    completedFolder,
    inProgressFolder,
    aiStore.doneFolderId,
    aiStore.folderAgentsMap,
  ]);

  const socketFileIds = React.useMemo(
    () => items.map((f) => f.id),
    [items],
  );

  const { fetchSection } = useFormsData();

  useFormsSocket(socketUrl, socketFolderIds, socketFileIds, fetchSection);
  useFormEventHooks(hasManagementAccess ? aiStore : null, socketUrl);
  // useUrlSync removed — navigation handled directly by FormsEditor

  const isEditing = Boolean(editingFile);

  useEditorGuard(isEditing);

  const prevIsLoading = React.useRef(isLoading);
  const pendingEditorClose = React.useRef(false);
  React.useEffect(() => {
    if (prevIsLoading.current && !isLoading) {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
      if (pendingEditorClose.current) {
        pendingEditorClose.current = false;
        closeEditor();
      }
    }
    prevIsLoading.current = isLoading;
  }, [isLoading, closeEditor]);

  // AI agent init for room
  React.useEffect(() => {
    if (roomId && user?.id && hasManagementAccess) {
      aiStore.initForRoom(roomId, user.id);
      aiStore.autoEnableIfAvailable();
    }
  }, [roomId, user?.id, aiStore, hasManagementAccess]);

  // AI store cleanup on section/folder navigation
  const prevPathname = React.useRef(pathname);
  const prevCompletedFolderShell = React.useRef(completedFolder);
  const prevInProgressFolderShell = React.useRef(inProgressFolder);
  React.useLayoutEffect(() => {
    const prevSection = sectionFromPathname(prevPathname.current);
    const sectionChanged = prevPathname.current !== pathname;
    const folderChanged =
      prevCompletedFolderShell.current !== completedFolder ||
      prevInProgressFolderShell.current !== inProgressFolder;

    prevPathname.current = pathname;
    prevCompletedFolderShell.current = completedFolder;
    prevInProgressFolderShell.current = inProgressFolder;

    if (sectionChanged) {
      // Reset subfolder state of the section we're LEAVING, not entering
      if (prevSection === FormsSection.CompletedForms) {
        goBackToCompletedRoot();
      }
      if (prevSection === FormsSection.InProgress) {
        goBackToInProgressRoot();
      }

      if (editingFile) {
        pendingEditorClose.current = true;
      } else {
        closeEditor();
      }

      if (activeSection === FormsSection.Settings) {
        pendingEditorClose.current = false;
        closeEditor();
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent(AnimationEvents.END_ANIMATION),
          );
        }, 0);
      } else {
        formsListStore.setIsLoading(true);
      }
    }

    if (sectionChanged || folderChanged) {
      if (hasManagementAccess) {
        aiStore.clearOverride();
      }

      if (activeSection === FormsSection.Settings && hasManagementAccess) {
        aiStore.closePanel();
      }

      // Only reset AI folder context on actual section changes, not on
      // intermediate folder changes (e.g., form completion sets completedFolder
      // while still on my-forms — the router hasn't navigated yet).
      if (
        sectionChanged &&
        activeSection !== FormsSection.CompletedForms &&
        hasManagementAccess
      ) {
        aiStore.setCurrentFolder(null);
      }
    }
  }, [pathname, completedFolder, inProgressFolder, activeSection, hasManagementAccess, aiStore, formsListStore]);

  // Refresh list after manual editor close (not form completion)
  const prevEditingFile = React.useRef(editingFile);
  React.useEffect(() => {
    if (prevEditingFile.current && !editingFile && !completedFolder) {
      fetchSection();
    }
    prevEditingFile.current = editingFile;
  }, [editingFile, fetchSection, completedFolder]);

  // Form completion: when completedFolder is set while editor is still open,
  // close the editor and navigate to completed-forms FROM the layout
  // (avoids race condition of closeEditor unmounting FormsEditor before router.replace)
  const prevCompletedForFormCompletion = React.useRef(completedFolder);
  React.useEffect(() => {
    const prev = prevCompletedForFormCompletion.current;
    prevCompletedForFormCompletion.current = completedFolder;

    if (completedFolder && completedFolder !== prev && editingFile) {
      // Form was just completed: completedFolder went from null to non-null while editing
      closeEditor();
      const roomId = searchParams.get("roomId") ?? "";
      router.replace(
        `${sectionToPath(FormsSection.CompletedForms)}${roomId ? `?roomId=${roomId}` : ""}`,
      );
    }
  }, [completedFolder, editingFile, closeEditor, router, searchParams]);

  const {
    onUploadFiles,
    onCreateBlankForm,
    isCreateFormDialogVisible,
    isCreatingForm,
    onCloseCreateFormDialog,
    onSaveCreateForm,
  } = useFolderActions();

  const handleEditorNavigatedAway = React.useCallback(() => {
    closeEditor();
  }, [closeEditor]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const isSettings = activeSection === FormsSection.Settings;

  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <Loader type={LoaderTypes.dualRing} size="40px" />
      </div>
    );
  }

  return (
    <div
      className={styles.root}
      ref={rootRef}
      style={
        { "--min-section-width": `${MIN_SECTION_WIDTH}px` } as React.CSSProperties
      }
    >
      <MobileStub />
      <FormsSidebar />
      <AiChatPanel rootRef={rootRef} />
      <div className={styles.sectionArea}>
        <Section
          withBodyScroll={!isEditing}
          withoutFooter={isEditing}
          settingsStudio={false}
          viewAs={isSettings ? "settings" : "tile"}
          isEmptyPage={
            !isEditing && !isLoading && items.length === 0 && folders.length === 0
          }
          currentDeviceType={currentDeviceType}
        >
          <Section.SectionHeader>
            <FormsHeader
              onUploadFiles={onUploadFiles}
              onCreateBlankForm={onCreateBlankForm}
            />
          </Section.SectionHeader>
          <Section.SectionBody>
            {isEditing && (
              <FormsEditor onNavigatedAway={handleEditorNavigatedAway} />
            )}
            <div style={{ display: isEditing ? "none" : undefined }}>
              {children}
            </div>
          </Section.SectionBody>
        </Section>
        <AiChatButton />
      </div>
      <CreateFormDialog
        visible={isCreateFormDialogVisible}
        isCreating={isCreatingForm}
        onClose={onCloseCreateFormDialog}
        onSave={onSaveCreateForm}
      />
    </div>
  );
};

export default observer(FormsShell);
