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
import { useRouter } from "next/navigation";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { frameCallEvent, getFrameId } from "@docspace/shared/utils/common";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

import styles from "./EditorPage.module.scss";

type EditorPageProps = {
  fileId: string;
  action?: string;
};

export default function EditorPage({ fileId, action }: EditorPageProps) {
  const router = useRouter();
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = React.useState(false);

  const [editorOrigin] = React.useState(
    () =>
      (typeof window !== "undefined" &&
        (window.ClientConfig?.proxy?.url ||
          window.ClientConfig?.api?.origin)) ||
      (typeof window !== "undefined" ? window.location.origin : ""),
  );

  const editorUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set("fileId", fileId);
    params.set("editorGoBack", "event");
    if (action) params.set("action", action);

    return combineUrl(editorOrigin, `/doceditor?${params.toString()}`);
  }, [fileId, action, editorOrigin]);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== editorOrigin) return;

      const data =
        typeof event.data === "string"
          ? (() => {
              try {
                return JSON.parse(event.data);
              } catch {
                return event.data;
              }
            })()
          : event.data;

      if (
        data === "close-editor" ||
        data?.type === "onRequestClose" ||
        (data?.type === "onEventReturn" &&
          data?.eventReturnData?.event === "onEditorCloseCallback")
      ) {
        router.replace("/personal-files");
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [editorOrigin, router]);

  const onIframeLoad = React.useCallback(() => {
    setIsReady(true);
    frameCallEvent({
      event: "onAppReady",
      data: { frameId: getFrameId() },
    });
    frameCallEvent({
      event: "onEditorOpen",
      data: { fileId, action: action ?? null },
    });
  }, [fileId, action]);

  return (
    <div className={styles.editorWrapper}>
      {!isReady && (
        <div className={styles.loaderOverlay}>
          <Loader type={LoaderTypes.track} size="40px" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={editorUrl}
        onLoad={onIframeLoad}
        className={isReady ? styles.editorIframe : styles.editorIframeHidden}
        allow="autoplay; camera; microphone; display-capture; clipboard-write"
      />
    </div>
  );
}
