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
  getMetadataCascadeProgress,
  updateFolderMetadataTemplate,
} from "@docspace/shared/api/metadata";
import type {
  TMetadataOperation,
  TUpdateFolderMetadataTemplateRequest,
} from "@docspace/shared/api/metadata/types";

import { getCascadeState, getLaunchResult } from "../utils";

const POLL_INTERVAL = 1000;

type TFolderOperation = {
  folderId: number;
  operation: TMetadataOperation;
};

const notifyWhenDone = (
  folderId: number,
  launchedId: string,
  doneMessage?: string,
) => {
  const poll = async () => {
    const operation = await getMetadataCascadeProgress(folderId).catch(
      () => null,
    );
    if (!operation) return;

    const result = getLaunchResult(operation, launchedId);

    if (result === "pending") setTimeout(poll, POLL_INTERVAL);
    if (result === "done" && doneMessage) toastr.success(doneMessage);
    if (result === "failed") toastr.error(operation.error);
  };

  poll();
};

export const useMetadataCascade = (
  folderId: number | null,
  onChange: () => Promise<void>,
) => {
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

        if (!data.isCompleted) timer = setTimeout(poll, POLL_INTERVAL);
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

  const setCascade = async (
    templateId: number,
    request: TUpdateFolderMetadataTemplateRequest,
    doneMessage?: string,
  ) => {
    if (folderId === null) return false;

    try {
      const data = await updateFolderMetadataTemplate(
        folderId,
        templateId,
        request,
      );

      if (data.id) {
        setState({ folderId, operation: data });
        notifyWhenDone(folderId, data.id, doneMessage);
      }
      setLaunches((count) => count + 1);

      await onChange();
      return true;
    } catch (e) {
      toastr.error(e as string);
      return false;
    }
  };

  const getTemplateState = (templateId: number) =>
    getCascadeState(operation, templateId);

  return { getTemplateState, setCascade };
};
