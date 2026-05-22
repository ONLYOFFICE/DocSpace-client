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

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { convertFile, storeOriginal } from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import { getFileConversationProgress } from "@docspace/shared/api/files";

import type { TFileItem } from "@/app/(docspace)/_hooks/useItemList";

import { useDocsSettingsStore } from "../_store/DocsSettingsStore";
import type { ConvertFormat } from "../_components/convert-dialog";

type ConvertProgressResponse = {
  progress?: number;
  error?: string;
}[];

const POLL_INTERVAL = 1000;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function useConvertActions() {
  const router = useRouter();
  const docsSettingsStore = useDocsSettingsStore();
  const { t } = useTranslation(["Common"]);

  const [convertDialogVisible, setConvertDialogVisible] = useState(false);
  const [convertTarget, setConvertTarget] = useState<TFileItem | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState<{
    percent: number;
    completed: boolean;
    alert: boolean;
  } | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearTimeout(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setConvertProgress(null);
  }, []);

  const requestConvert = useCallback((item: TFileItem) => {
    setConvertTarget(item);
    setConvertDialogVisible(true);
  }, []);

  const closeConvertDialog = useCallback(() => {
    if (isConverting) return;
    setConvertDialogVisible(false);
    setConvertTarget(null);
  }, [isConverting]);

  const onChangeStoreOriginal = useCallback(
    async (next: boolean) => {
      const settings = docsSettingsStore.filesSettings;
      try {
        await storeOriginal(next);
        if (settings) {
          docsSettingsStore.setFilesSettings({
            ...settings,
            storeOriginalFiles: next,
          });
        }
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      }
    },
    [docsSettingsStore],
  );

  const confirmConvert = useCallback(
    async (format: ConvertFormat | null) => {
      if (!convertTarget) return;

      setIsConverting(true);
      clearProgress();
      setConvertProgress({ percent: 0, completed: false, alert: false });
      setConvertDialogVisible(false);

      try {
        const fileId = convertTarget.id;

        const initial = (await convertFile(
          fileId,
          format as unknown as null,
          null,
        )) as unknown as ConvertProgressResponse;

        let progress = initial?.[0]?.progress ?? 0;
        let convertError = initial?.[0]?.error ?? null;

        setConvertProgress({
          percent: progress,
          completed: false,
          alert: false,
        });

        while (progress < 100 && !convertError) {
          await wait(POLL_INTERVAL);
          const response = (await getFileConversationProgress(
            fileId as number,
          )) as ConvertProgressResponse;
          progress = response?.[0]?.progress ?? progress;
          convertError = response?.[0]?.error ?? null;
          setConvertProgress({
            percent: progress,
            completed: false,
            alert: false,
          });
        }

        if (convertError) {
          throw new Error(convertError);
        }

        setConvertTarget(null);
        setConvertProgress({ percent: 100, completed: true, alert: false });
        progressTimerRef.current = setTimeout(clearProgress, 3000);

        router.refresh();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[useConvertActions] convertFile failed", error);
        setConvertProgress((prev) =>
          prev ? { ...prev, alert: true, completed: true } : prev,
        );
        progressTimerRef.current = setTimeout(clearProgress, 5000);
        toastr.error(
          error instanceof Error ? error.message : t("Common:FailedToConvert"),
        );
      } finally {
        setIsConverting(false);
      }
    },
    [convertTarget, router, t, clearProgress],
  );

  return {
    convertDialogVisible,
    convertTarget,
    isConverting,
    convertProgress,
    requestConvert,
    closeConvertDialog,
    confirmConvert,
    onChangeStoreOriginal,
  };
}

