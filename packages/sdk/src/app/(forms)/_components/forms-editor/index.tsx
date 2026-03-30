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

import { observer } from "mobx-react";
import { runInAction } from "mobx";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import { FolderType } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import { FormsSection } from "@/types/forms";

import { sectionToPath } from "../../_utils/sectionFromPathname";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import { useFormsSettingsStore } from "../../_store/FormsSettingsStore";
import { useFormsListStore } from "../../_store/FormsListStore";
import { useFormsAiAgentStore } from "../../_store/FormsAiAgentStore";
import styles from "./FormsEditor.module.scss";

type FormsEditorProps = {
  onNavigatedAway?: () => void;
};

const FormsEditor = ({ onNavigatedAway }: FormsEditorProps) => {
  const { t } = useTranslation(["Common"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdRef = React.useRef(searchParams.get("roomId") ?? "");
  roomIdRef.current = searchParams.get("roomId") ?? "";
  const {
    editingFile,
    editorAction,
    closeEditor,
    openCompletedFolder,
  } = useFormsNavigationStore();
  const { roomId } = useFormsSettingsStore();
  const formsListStore = useFormsListStore();
  const aiStore = useFormsAiAgentStore();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [isIframeLoaded, setIsIframeLoaded] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const completionStarted = React.useRef(false);

  const editorOrigin = React.useMemo(
    () =>
      window.ClientConfig?.proxy?.url ||
      window.ClientConfig?.api?.origin ||
      window.location.origin,
    [],
  );

  const editorUrl = React.useMemo(() => {
    if (!editingFile) return "";

    const params = new URLSearchParams();
    params.set("fileId", editingFile.id.toString());
    params.append("action", editorAction);
    params.append("editorGoBack", "event");

    return combineUrl(editorOrigin, `/doceditor?${params.toString()}`);
  }, [editingFile, editorAction, editorOrigin]);

  const handleFormCompleted = React.useCallback(async () => {
    if (completionStarted.current) return;
    completionStarted.current = true;

    const formTitle = editingFile?.title?.replace(/\.pdf$/i, "");

    setIsCompleting(true);

    if (!roomId || !formTitle) {
      closeEditor();
      router.replace(
        sectionToPath(FormsSection.CompletedForms) +
          (roomIdRef.current ? `?roomId=${roomIdRef.current}` : ""),
      );
      setIsCompleting(false);
      return;
    }

    const MAX_RETRIES = 5;
    const RETRY_DELAY = 1500;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const filter = FilesFilter.getDefault();
        const roomRes = await api.files.getFolder(roomId, filter);
        const doneFolder = roomRes.folders.find(
          (f) => f.type === FolderType.Done,
        );

        if (!doneFolder) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          continue;
        }

        aiStore.setDoneFolderId(doneFolder.id);

        const doneRes = await api.files.getFolder(doneFolder.id, filter);
        const subfolder = doneRes.folders.find(
          (f) => f.title.replace(/\.pdf$/i, "") === formTitle,
        );

        if (subfolder) {
          runInAction(() => {
            formsListStore.setItems([], 0);
            formsListStore.setFolders([]);
            formsListStore.setIsLoading(true);
            openCompletedFolder(subfolder);
          });
          return;
        }

        await new Promise((r) => setTimeout(r, RETRY_DELAY));
      } catch {
        break;
      }
    }

    // Fallback: navigate to CompletedForms root
    closeEditor();
    router.replace(
      sectionToPath(FormsSection.CompletedForms) +
        (roomIdRef.current ? `?roomId=${roomIdRef.current}` : ""),
    );
    setIsCompleting(false);
  }, [
    roomId,
    editingFile?.title,
    formsListStore,
    aiStore,
    router,
    openCompletedFolder,
    closeEditor,
  ]);

  const checkCompletedUrl = React.useCallback(() => {
    try {
      const href = iframeRef.current?.contentWindow?.location.href;
      if (!href) return false;

      if (href.includes("completed-form")) {
        handleFormCompleted();
        return true;
      }

      if (
        isIframeLoaded &&
        !href.includes("/doceditor") &&
        !href.includes("about:blank")
      ) {
        onNavigatedAway?.();
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, [handleFormCompleted, isIframeLoaded, onNavigatedAway]);

  React.useEffect(() => {
    setIsIframeLoaded(false);
    completionStarted.current = false;
  }, [editingFile?.id]);

  React.useEffect(() => {
    if (!editingFile) return;

    const interval = setInterval(checkCompletedUrl, 500);
    return () => clearInterval(interval);
  }, [editingFile, checkCompletedUrl]);

  React.useEffect(() => {
    if (!editingFile) return;

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== editorOrigin) return;

      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          // use raw string
        }
      }

      if (
        data?.type === "onRequestClose" ||
        data === "close-editor" ||
        data?.eventReturnData?.event === "onEditorCloseCallback"
      ) {
        closeEditor();
      }

      if (data?.type === "onFormComplete" || data === "completed-form") {
        handleFormCompleted();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [editingFile, closeEditor, handleFormCompleted, editorOrigin]);

  const onIframeLoad = React.useCallback(() => {
    setIsIframeLoaded(true);
    checkCompletedUrl();
  }, [checkCompletedUrl]);

  if (!editingFile || !editorUrl) return null;

  return (
    <div className={styles.editorWrapper}>
      {(!isIframeLoaded || isCompleting) && (
        <div className={styles.loaderOverlay}>
          <Loader type={LoaderTypes.track} size="40px" />
        </div>
      )}
      {!isCompleting && (
        <iframe
          ref={iframeRef}
          src={editorUrl}
          onLoad={onIframeLoad}
          className={
            isIframeLoaded ? styles.editorIframe : styles.editorIframeHidden
          }
          allow="autoplay; camera; microphone; display-capture; clipboard-write"
          referrerPolicy="no-referrer"
          title={t("Common:FormEditor")}
        />
      )}
    </div>
  );
};

export default observer(FormsEditor);
