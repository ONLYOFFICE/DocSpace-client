/*
 * Copyright (C) Ascensio System SIA, 2009-2026. AGPL-3.0-only.
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import type { AttachedFile } from "@/types/arbiter";
import styles from "./FilePicker.module.scss";

async function getMyFolderId(): Promise<number | null> {
  try {
    const res = await fetch("/api/2.0/files/@my", {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.response?.current?.id as number) ?? null;
  } catch {
    return null;
  }
}

type FilePickerProps = {
  disabled?: boolean;
  onSelect: (file: AttachedFile) => void;
};

export function FilePicker({ disabled, onSelect }: FilePickerProps) {
  const [selectorUrl, setSelectorUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const handleOpen = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const folderId = await getMyFolderId();
      const params = new URLSearchParams({
        header: "true",
        cancel: "true",
        breadCrumbs: "true",
        search: "true",
      });
      if (folderId) params.set("id", String(folderId));
      setSelectorUrl(`/sdk/file-selector?${params}`);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const handleClose = useCallback(() => setSelectorUrl(null), []);

  useEffect(() => {
    if (!selectorUrl) return;

    const handler = (e: MessageEvent) => {
      try {
        const msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (msg?.type !== "onEventReturn") return;

        const { event, data } = (msg.eventReturnData ?? {}) as {
          event?: string;
          data?: Record<string, unknown>;
        };

        if (event === "onSelectCallback" && data?.id != null) {
          const name =
            (data.title as string) ??
            (data.fileName as string) ??
            "";
          onSelectRef.current({ id: data.id as number, name });
          setSelectorUrl(null);
        } else if (event === "onCloseCallback") {
          setSelectorUrl(null);
        }
      } catch {
        // ignore malformed messages
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [selectorUrl]);

  return (
    <>
      <button
        type="button"
        className={styles.attachBtn}
        disabled={disabled || loading}
        onClick={handleOpen}
        title="Attach a file"
      >
        {loading ? "…" : "📎"}
      </button>

      {selectorUrl && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal
          onClick={handleClose}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className={styles.iframe}
              src={selectorUrl}
              title="Select file"
            />
          </div>
        </div>
      )}
    </>
  );
}
