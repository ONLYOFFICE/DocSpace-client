"use client";

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

import React, { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { getFileInfo } from "@docspace/shared/api/files";
import type { TFile } from "@docspace/ui-kit/types";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { frameCallEvent, getFrameId } from "@docspace/shared/utils/common";
import useFrameHeaderConfig from "@/hooks/useFrameHeaderConfig";

const Chat = dynamic(() => import("@docspace/ui-kit/ai-agent/chat"), {
  ssr: false,
});

const fullSize: React.CSSProperties = { width: "100%", height: "100%" };

type ChatPageProps = {
  agentId: string;
  fileId: string;
  chatId: string;
};

const ChatPageClient = ({ agentId, fileId, chatId }: ChatPageProps) => {
  const { headerOffset, headerHeight } = useFrameHeaderConfig();

  const [attachmentFile, setAttachmentFile] = useState<Partial<TFile> | null>(
    null,
  );
  const [isFileLoading, setIsFileLoading] = useState(!!fileId);
  const [isChatReady, setIsChatReady] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!agentId) {
      frameCallEvent({
        event: "onAppError",
        data: "agentId is required",
      });
      return;
    }

    frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
  }, [agentId]);

  useEffect(() => {
    if (!fileId) return;

    let cancelled = false;

    setIsFileLoading(true);

    getFileInfo(fileId)
      .then((file) => {
        if (!cancelled) setAttachmentFile(file as unknown as Partial<TFile>);
      })
      .catch((err) => {
        console.error("Failed to fetch file info:", err);
        frameCallEvent({
          event: "onAppError",
          data: String(err),
        });
      })
      .finally(() => {
        if (!cancelled) setIsFileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fileId]);

  // Detect when Chat finishes internal initialization.
  // ChatContainer sets data-testid="chat-container" (without "-loading" suffix)
  // when isLoadingChat becomes false. We watch both attribute changes (normal
  // transition) and childList (ChatCore may swap the entire ChatContainer element
  // in the error/no-access path).
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !agentId) return;

    const check = () =>
      !!el.querySelector('[data-testid="chat-container"]');

    if (check()) {
      setIsChatReady(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (check()) {
        setIsChatReady(true);
        observer.disconnect();
      }
    });

    observer.observe(el, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-testid"],
    });

    // Fallback: if Chat gets stuck loading, reveal it after 15 s so the user
    // can at least see whatever state it ended up in.
    const timerId = window.setTimeout(() => {
      if (!isChatReady) {
        setIsChatReady(true);
        observer.disconnect();
      }
    }, 15_000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timerId);
    };
  }, [agentId]);

  const clearAttachmentFile = useCallback(() => setAttachmentFile(null), []);

  if (!agentId) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      style={{ ...fullSize, position: "relative" }}
    >
      {headerOffset > 0 && (
        <style>
          {`.chat-header { padding-inline-start: ${headerOffset}px; }`}
        </style>
      )}
      {headerHeight > 0 && (
        <style>{`.chat-header { height: ${headerHeight}px; }`}</style>
      )}
      {!isChatReady && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Loader type={LoaderTypes.dualRing} size="40px" />
        </div>
      )}
      <div
        style={{
          ...fullSize,
          visibility: isChatReady ? "visible" : "hidden",
        }}
      >
        <Chat
          agentId={agentId}
          selectedModel=""
          standalone
          attachmentFile={attachmentFile}
          clearAttachmentFile={clearAttachmentFile}
          allowAttachFiles
          allowSelectChat
          isLoading={isFileLoading}
          width="100%"
          height="100%"
          style={fullSize}
        />
      </div>
    </div>
  );
};

export default ChatPageClient;
