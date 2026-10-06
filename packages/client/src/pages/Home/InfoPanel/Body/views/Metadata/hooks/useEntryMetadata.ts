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

import { useCallback, useEffect, useRef, useState } from "react";

import SocketHelper, {
  SocketEvents,
} from "@onlyoffice/apps-ui-kit/utils/socket";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  assignMetadataTemplates,
  getEntryMetadata,
  setMetadataCustomFields,
  setMetadataValues,
  unassignMetadataTemplate,
} from "@docspace/shared/api/metadata";
import type {
  TCustomFieldRequest,
  TEntryMetadata,
  TMetadataValueRequest,
} from "@docspace/shared/api/metadata/types";

import type { TMetadataSelection } from "../types";
import { getEntryKind } from "../utils";

type TEntryUpdate = {
  cmd?: string;
  type?: string;
  id?: string | number;
};

export const useEntryMetadata = (item: TMetadataSelection) => {
  const kind = getEntryKind(item);
  const entryId = Number(item.id);

  const [metadata, setMetadata] = useState<TEntryMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const lastRequest = useRef(0);

  const loadMetadata = useCallback(async () => {
    const request = ++lastRequest.current;

    try {
      const data = await getEntryMetadata(kind, entryId);
      if (request === lastRequest.current) setMetadata(data);
    } catch (e) {
      if (request === lastRequest.current) toastr.error(e as string);
    } finally {
      if (request === lastRequest.current) setIsLoading(false);
    }
  }, [kind, entryId]);

  useEffect(() => {
    setMetadata(null);
    setIsLoading(true);
    loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    const onEntryUpdate = ({ cmd, type, id }: TEntryUpdate = {}) => {
      if (cmd === "update" && type === kind && Number(id) === entryId) {
        loadMetadata();
      }
    };

    SocketHelper?.on(SocketEvents.ModifyFolder, onEntryUpdate);

    return () => {
      SocketHelper?.off(SocketEvents.ModifyFolder, onEntryUpdate);
    };
  }, [kind, entryId, loadMetadata]);

  const mutate = async (action: () => Promise<TEntryMetadata>) => {
    try {
      const data = await action();
      lastRequest.current += 1;
      setMetadata(data);
      return true;
    } catch (e) {
      toastr.error(e as string);
      await loadMetadata();
      return false;
    }
  };

  const saveTemplate = (templateId: number, values: TMetadataValueRequest[]) =>
    mutate(async () => {
      const isAssigned = metadata?.templates.some(
        (template) => template.id === templateId,
      );

      if (!isAssigned) {
        await assignMetadataTemplates(kind, entryId, {
          templateIds: [templateId],
        });
      }

      return values.length
        ? setMetadataValues(kind, entryId, values)
        : getEntryMetadata(kind, entryId);
    });

  const deleteTemplate = (templateId: number) =>
    mutate(async () => {
      await unassignMetadataTemplate(kind, entryId, templateId);
      return getEntryMetadata(kind, entryId);
    });

  const saveCustomFields = (fields: TCustomFieldRequest[]) =>
    mutate(async () => {
      await setMetadataCustomFields(kind, entryId, fields);
      return getEntryMetadata(kind, entryId);
    });

  return {
    metadata,
    isLoading,
    saveTemplate,
    deleteTemplate,
    saveCustomFields,
  };
};
