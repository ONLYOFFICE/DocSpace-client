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

import { useEffect, useState } from "react";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  assignMetadataTemplates,
  getMetadataCascadeProgress,
} from "@docspace/shared/api/metadata";
import type { TMetadataOperation } from "@docspace/shared/api/metadata/types";

import type { TCascadeConflict } from "../types";
import { getCascadeState } from "../utils";

const POLL_INTERVAL = 1000;

const cascadedTemplates = new Map<number, Set<number>>();
const runningTemplates = new Map<number, number>();

type TFolderOperation = {
  folderId: number;
  operation: TMetadataOperation;
};

export const useMetadataCascade = (folderId: number | null) => {
  const [state, setState] = useState<TFolderOperation | null>(null);
  const [launches, setLaunches] = useState(0);

  const operation = state?.folderId === folderId ? state.operation : null;

  useEffect(() => {
    if (folderId === null) return;

    let isActive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const data = await getMetadataCascadeProgress(folderId);
        if (!isActive) return;

        setState({ folderId, operation: data });

        if (!data.isCompleted) {
          timer = setTimeout(poll, POLL_INTERVAL);
          return;
        }

        runningTemplates.delete(folderId);
        if (data.error && launches) toastr.error(data.error);
      } catch (e) {
        if (isActive) toastr.error(e as string);
      }
    };

    poll();

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [folderId, launches]);

  const start = async (
    templateId: number,
    conflictResolveType: TCascadeConflict,
  ) => {
    if (folderId === null) return false;

    try {
      const data = await assignMetadataTemplates("folder", folderId, {
        templateIds: [templateId],
        cascade: true,
        conflictResolveType,
      });

      cascadedTemplates.set(
        folderId,
        new Set(cascadedTemplates.get(folderId)).add(templateId),
      );
      runningTemplates.set(folderId, templateId);

      if (data) setState({ folderId, operation: data });
      setLaunches((count) => count + 1);

      return true;
    } catch (e) {
      toastr.error(e as string);
      return false;
    }
  };

  const getTemplateState = (templateId: number) =>
    getCascadeState(operation, {
      templateId,
      appliedIds:
        folderId === null ? undefined : cascadedTemplates.get(folderId),
      runningTemplateId:
        folderId === null ? undefined : runningTemplates.get(folderId),
    });

  return { getTemplateState, start };
};
