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
import dynamic from "next/dynamic";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import Section from "@docspace/ui-kit/components/section";
import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import {
  FloatingButton,
  FloatingButtonIcons,
} from "@docspace/ui-kit/components/floating-button";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";
import { setAuthToken } from "@docspace/shared/api/client";
import {
  frameCallbackData,
  frameCallEvent,
  frameHandlePing,
  getFrameId,
} from "@docspace/shared/utils/common";
import { DeviceType } from "@docspace/shared/enums";

import useDeviceType from "@/hooks/useDeviceType";
import { useSDKConfig } from "@/providers/SDKConfigProvider";
import {
  FormsSection,
  DEFAULT_SETTINGS_SUBSECTION,
  type CustomActionsConfig,
} from "@/types/forms";
import {
  sectionFromPathname,
  sectionToPath,
  settingsSubSectionToPath,
} from "../_utils/sectionFromPathname";
import { appendRoomParams } from "../_utils/formsUrl";
import { useFormsNavigationStore } from "../_store/FormsNavigationStore";
// LibraryNavigationStore removed — library uses URL routing now
import { useFormsListStore } from "../_store/FormsListStore";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsDbSettingsStore } from "../_store/FormsDbSettingsStore";
import { useFormsUserStore } from "../_store/FormsUserStore";
import useInitCommonStores, {
  type CommonData,
} from "../_hooks/useInitCommonStores";
import useFormsData from "../_hooks/useFormsData";
import { FormsDataProvider } from "../_context/FormsDataContext";
import useFolderActions from "../_hooks/useFolderActions";
import useFormsSocket from "../_hooks/useFormsSocket";
import useFormEventHooks from "../_hooks/useFormEventHooks";
import useEditorGuard from "../_hooks/useEditorGuard";

import { MIN_SECTION_WIDTH } from "../_api/aiAgentSettings";
import { useFormsTourStore } from "../_store/FormsTourStore";
import { useFormsCustomActionsStore } from "../_store/FormsCustomActionsStore";
import useTourSandbox from "../_hooks/useTourSandbox";
import FormsSidebar from "../_components/sidebar";
import DualRingSpinner from "../_components/forms-layout/DualRingSpinner";
import FormsEditor from "../_components/forms-editor";
import FormsHeader from "../_components/forms-header";

const AiChatPanel = dynamic(() => import("../_components/ai-chat-panel"), {
  ssr: false,
});
const AiChatButton = dynamic(() => import("../_components/ai-chat-button"), {
  ssr: false,
});
const CreateFormDialog = dynamic(
  () => import("../_components/create-form-dialog"),
  { ssr: false },
);
const WelcomeTourDialog = dynamic(
  () => import("../_components/welcome-tour-dialog"),
  { ssr: false },
);
const FormsTourHost = dynamic(
  () => import("../_components/forms-tour/FormsTourHost"),
  { ssr: false },
);
import {
  createMockFormFolders,
  createMockFormFiles,
  createMockCompletedFiles,
} from "../_utils/mockFormFiles";
import styles from "../_components/forms-layout/FormsLayout.module.scss";

type FormsShellProps = {
  commonData: CommonData & { authToken: string };
  children: React.ReactNode;
};

const FormsShell = ({ commonData, children }: FormsShellProps) => {
  const { sdkConfig } = useSDKConfig();
  const isReady = useInitCommonStores(commonData);

  const formsNavigationStore = useFormsNavigationStore();
  const {
    editingFile,
    closeEditor,
    completedFolder,
    inProgressFolder,
    goBackToCompletedRoot,
    goBackToInProgressRoot,
    isSidebarOpen,
    closeSidebar,
  } = formsNavigationStore;
  // libraryNav removed — library uses URL routing now
  const aiStore = useFormsAiAgentStore();
  const dbSettingsStore = useFormsDbSettingsStore();
  const { sendToDb } = dbSettingsStore;
  const { user } = useFormsUserStore();
  const formsSettingsStore = useFormsSettingsStore();
  const { roomId, socketUrl, hasManagementAccess } = formsSettingsStore;
  const formsListStore = useFormsListStore();
  const { items, folders, isLoading } = formsListStore;
  const tourStore = useFormsTourStore();
  const customActionsStore = useFormsCustomActionsStore();
  const { currentDeviceType } = useDeviceType();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);

  const initialShowMenu = React.useRef(
    searchParams.get("showMenu") !== "false",
  );
  const showMenu = initialShowMenu.current && sdkConfig?.showMenu !== false;

  const uploadFilesDirectRef = React.useRef<(files: File[]) => Promise<void>>(
    async () => {},
  );

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

  const appReadySent = React.useRef(false);
  React.useEffect(() => {
    if (isReady && !appReadySent.current) {
      appReadySent.current = true;
      frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
    }
  }, [isReady]);

  const prevSectionForEvent = React.useRef(activeSection);
  React.useEffect(() => {
    if (prevSectionForEvent.current !== activeSection) {
      prevSectionForEvent.current = activeSection;
      frameCallEvent({ event: "onNavigate", data: { section: activeSection } });
    }
  }, [activeSection]);

  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      let eventData;
      if (window.self === window.parent || e.source !== window.parent) return;

      try {
        eventData = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }

      if (frameHandlePing(eventData)) return;

      if (
        eventData?.type === "uploadFileData" &&
        eventData?.buffer instanceof ArrayBuffer
      ) {
        const fileName = eventData.fileName as string;
        const uploadId = eventData.uploadId as number | undefined;
        const file = new File([eventData.buffer], fileName, {
          lastModified: eventData.lastModified,
        });
        uploadFilesDirectRef
          .current([file])
          .then(() => {
            frameCallEvent({
              event: "onUploadSuccess",
              data: {
                fileName,
                fileSize: file.size,
                ...(uploadId !== undefined && { uploadId }),
              },
            });
          })
          .catch((error: unknown) => {
            frameCallEvent({
              event: "onUploadError",
              data: {
                fileName,
                message: error instanceof Error ? error.message : String(error),
                ...(uploadId !== undefined && { uploadId }),
              },
            });
          });
        return;
      }

      const methodName = eventData?.data?.methodName;
      const data = eventData?.data?.data;
      const callId = eventData?.data?.callId;

      switch (methodName) {
        case "navigateSection": {
          const section = data?.section as string;
          if (!section) return;

          const validSections = Object.values(FormsSection) as string[];
          if (!validSections.includes(section)) return;

          if (section === FormsSection.Settings) {
            router.replace(
              appendRoomParams(
                settingsSubSectionToPath(DEFAULT_SETTINGS_SUBSECTION),
                searchParams,
              ),
            );
          } else {
            router.replace(
              appendRoomParams(
                sectionToPath(section as FormsSection),
                searchParams,
              ),
            );
          }

          frameCallbackData({ section }, callId);
          break;
        }
        case "setCustomActions": {
          if (data) customActionsStore.setActions(data as CustomActionsConfig);
          frameCallbackData(data, callId);
          break;
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [router, searchParams, customActionsStore]);

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

  const socketFileIds = React.useMemo(() => items.map((f) => f.id), [items]);

  const formsData = useFormsData();
  const { fetchSection, fetchMore, fetchSubfolder } = formsData;

  useFormsSocket(socketUrl, socketFolderIds, socketFileIds, fetchSection);
  useFormEventHooks(hasManagementAccess ? aiStore : null, socketUrl);


  const isEditing = Boolean(editingFile);

  useEditorGuard(isEditing);

  // Single-overlay coordination: only one of {sidebar drawer, AI panel, editor}
  // can be active at a time on mobile. Also close the sidebar when leaving
  // mobile so no stale overlay stays rendered.
  React.useEffect(() => {
    if (currentDeviceType !== DeviceType.mobile && isSidebarOpen) {
      closeSidebar();
    }
  }, [currentDeviceType, isSidebarOpen, closeSidebar]);

  const prevSidebarOpen = React.useRef(isSidebarOpen);
  React.useEffect(() => {
    if (!prevSidebarOpen.current && isSidebarOpen && aiStore.isPanelVisible) {
      aiStore.closePanel();
    }
    prevSidebarOpen.current = isSidebarOpen;
  }, [isSidebarOpen, aiStore]);

  const prevPanelVisible = React.useRef(aiStore.isPanelVisible);
  React.useEffect(() => {
    if (!prevPanelVisible.current && aiStore.isPanelVisible && isSidebarOpen) {
      closeSidebar();
    }
    prevPanelVisible.current = aiStore.isPanelVisible;
  }, [aiStore.isPanelVisible, isSidebarOpen, closeSidebar]);

  React.useEffect(() => {
    if (isEditing && isSidebarOpen) {
      closeSidebar();
    }
  }, [isEditing, isSidebarOpen, closeSidebar]);

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

  React.useEffect(() => {
    if (!roomId || !user?.id || !hasManagementAccess) return;

    aiStore.initForRoom(roomId, user.id);

    const runAutoEnable = () => aiStore.autoEnableIfAvailable();
    const win = window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(runAutoEnable, { timeout: 2000 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(runAutoEnable, 2000);
    return () => window.clearTimeout(id);
  }, [roomId, user?.id, aiStore, hasManagementAccess]);

  React.useEffect(() => {
    if (!roomId || !user?.id || !hasManagementAccess || !sendToDb) return;
    aiStore.initAskFromDBAgent();
  }, [roomId, user?.id, aiStore, hasManagementAccess, sendToDb]);

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
      // Navigation within settings sub-pages should not trigger full section-change logic
      const isSettingsInternalNav =
        prevSection === FormsSection.Settings &&
        activeSection === FormsSection.Settings;

      if (isSettingsInternalNav) {
        if (!tourStore.isRunning) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
          }, 0);
        }
      } else {
        if (prevSection === FormsSection.CompletedForms) {
          goBackToCompletedRoot();
        }
        if (prevSection === FormsSection.InProgress) {
          goBackToInProgressRoot();
        }

        if (tourStore.showMockItems) {
          // During tour: skip data clearing, just fire animation
          closeEditor();
          formsListStore.setIsLoading(false);
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent(AnimationEvents.END_ANIMATION),
            );
          }, 0);
        } else {
          if (editingFile) {
            formsListStore.setItems([], 0);
            formsListStore.setFolders([]);
            formsListStore.setIsLoading(true);
            pendingEditorClose.current = true;
          } else {
            closeEditor();
          }

          if (
            activeSection === FormsSection.Settings ||
            activeSection === FormsSection.Library
          ) {
            pendingEditorClose.current = false;
            closeEditor();
            formsListStore.setIsLoading(false);
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent(AnimationEvents.END_ANIMATION),
              );
            }, 0);
          }

          if (prevSection === FormsSection.Settings) {
            formsListStore.setItems([], 0);
            formsListStore.setFolders([]);
            formsListStore.setIsLoading(true);
          }
        }
      }
    }

    if (sectionChanged || folderChanged) {
      if (hasManagementAccess && !tourStore.isRunning) {
        aiStore.clearOverride();
      }

      if (
        activeSection === FormsSection.Settings &&
        hasManagementAccess &&
        !tourStore.isRunning
      ) {
        aiStore.closePanel();
      }

      if (
        sectionChanged &&
        activeSection !== FormsSection.CompletedForms &&
        hasManagementAccess
      ) {
        aiStore.setCurrentFolder(null);
      }
    }
  }, [
    pathname,
    completedFolder,
    inProgressFolder,
    activeSection,
    hasManagementAccess,
    aiStore,
    formsListStore,
  ]);

  const prevEditingFile = React.useRef(editingFile);
  React.useEffect(() => {
    if (prevEditingFile.current && !editingFile && !completedFolder) {
      fetchSection();
    }
    prevEditingFile.current = editingFile;
  }, [editingFile, fetchSection, completedFolder]);

  const prevCompletedForFormCompletion = React.useRef(completedFolder);
  React.useEffect(() => {
    const prev = prevCompletedForFormCompletion.current;
    prevCompletedForFormCompletion.current = completedFolder;

    if (completedFolder && completedFolder !== prev && editingFile) {
      router.replace(
        appendRoomParams(
          sectionToPath(FormsSection.CompletedForms),
          searchParams,
        ),
      );
    }
  }, [completedFolder, editingFile, router, searchParams]);

  const {
    onUploadFiles,
    uploadFilesToFolder,
    uploadProgress,
    onCreateBlankForm,
    isCreateFormDialogVisible,
    isCreatingForm,
    onCloseCreateFormDialog,
    onSaveCreateForm,
  } = useFolderActions(fetchSection);
  uploadFilesDirectRef.current = uploadFilesToFolder;

  const formsDataValue = React.useMemo(
    () => ({ fetchSection, fetchMore, fetchSubfolder }),
    [fetchSection, fetchMore, fetchSubfolder],
  );

  const handleEditorNavigatedAway = React.useCallback(() => {
    closeEditor();
  }, [closeEditor]);

  useTourSandbox(fetchSection);

  // Show welcome dialog on first visit
  const [showWelcome, setShowWelcome] = React.useState(false);
  React.useEffect(() => {
    if (
      isReady &&
      !tourStore.tourCompleted &&
      !tourStore.isRunning &&
      activeSection === FormsSection.MyForms
    ) {
      setShowWelcome(true);
    }
  }, [isReady, tourStore.tourCompleted, tourStore.isRunning, activeSection]);

  // Inject mock data when navigating between sections during tour
  React.useEffect(() => {
    if (!tourStore.isRunning) return;

    if (activeSection === FormsSection.CompletedForms) {
      if (completedFolder) {
        formsListStore.setFolders([]);
        formsListStore.setItems(
          createMockCompletedFiles(completedFolder.title),
          5,
        );
      } else {
        formsListStore.setFolders(createMockFormFolders());
        formsListStore.setItems([], 0);
      }
    } else if (activeSection === FormsSection.InProgress) {
      formsListStore.setFolders(createMockFormFolders());
      formsListStore.setItems([], 0);
    } else if (activeSection === FormsSection.MyForms) {
      formsListStore.setFolders([]);
      formsListStore.setItems(createMockFormFiles(), 10);
    } else {
      // Settings / Library — clear mock data from previous section
      formsListStore.setFolders([]);
      formsListStore.setItems([], 0);
    }
    formsListStore.setIsLoading(false);
  }, [activeSection, completedFolder, tourStore.isRunning, formsListStore]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const isSettings = activeSection === FormsSection.Settings;

  if (!isReady) {
    return <DualRingSpinner />;
  }

  return (
    <div
      className={styles.root}
      ref={rootRef}
      style={
        {
          "--min-section-width": `${MIN_SECTION_WIDTH}px`,
        } as React.CSSProperties
      }
    >
      {showMenu && <FormsSidebar />}
      {showMenu && (
        <Backdrop
          visible={
            isSidebarOpen && currentDeviceType === DeviceType.mobile
          }
          onClick={closeSidebar}
          zIndex={220}
          withBackground
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      )}
      <AiChatPanel rootRef={rootRef} />
      <div className={styles.sectionArea}>
        <Section
          withBodyScroll={!isEditing}
          withoutFooter={isEditing}
          settingsStudio={false}
          viewAs={isSettings ? "settings" : "tile"}
          isEmptyPage={
            !isEditing &&
            !isLoading &&
            items.length === 0 &&
            folders.length === 0
          }
          currentDeviceType={currentDeviceType}
        >
          <Section.SectionHeader>
            <FormsHeader
              onUploadFiles={onUploadFiles}
              onCreateBlankForm={onCreateBlankForm}
              showMenu={showMenu}
            />
          </Section.SectionHeader>
          <Section.SectionBody>
            {isEditing && (
              <FormsEditor onNavigatedAway={handleEditorNavigatedAway} />
            )}
            <FormsDataProvider value={formsDataValue}>
              <div style={{ display: isEditing ? "none" : undefined }}>
                {children}
              </div>
            </FormsDataProvider>
          </Section.SectionBody>
        </Section>
        <AiChatButton shiftUp={!!uploadProgress} />
        {uploadProgress && (
          <div className={styles.floatingButtonContainer}>
            <FloatingButton
              icon={FloatingButtonIcons.upload}
              percent={uploadProgress.percent}
              completed={uploadProgress.completed}
              alert={uploadProgress.alert}
            />
          </div>
        )}
      </div>
      {isCreateFormDialogVisible && (
        <CreateFormDialog
          visible={isCreateFormDialogVisible}
          isCreating={isCreatingForm}
          onClose={onCloseCreateFormDialog}
          onSave={onSaveCreateForm}
        />
      )}
      {showWelcome && (
        <WelcomeTourDialog
          visible={showWelcome}
          onStart={() => {
            setShowWelcome(false);
            tourStore.startTour();
          }}
          onSkip={() => {
            setShowWelcome(false);
            tourStore.completeTour();
          }}
        />
      )}
      {!tourStore.tourCompleted && <FormsTourHost showMenu={showMenu} />}
    </div>
  );
};

export default observer(FormsShell);

