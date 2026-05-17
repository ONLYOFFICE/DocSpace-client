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

import { useState, useMemo, useCallback } from "react";
import { useQueries } from "@tanstack/react-query";
import { getUserPhoto } from "@docspace/shared/api/people";
import type {
  EditorUser,
  UserPhoto,
  UseEditorsDataProps,
  UseEditorsDataReturn,
} from "../EditorsTooltip.types";
import { GUID_EMPTY } from "SRC_DIR/helpers/constants";

const createEditorsArray = (
  activeEditors: Record<string, string> | undefined,
  editingBy: Record<string, string> | undefined,
  currentUserId?: string,
): EditorUser[] => {
  const currentEditingBy = activeEditors || editingBy;

  if (!currentEditingBy) return [];

  return Object.entries(currentEditingBy).map(([id, name]) => ({
    id,
    name: currentUserId && id === currentUserId ? "Me" : name,
    photo: null,
  }));
};

const sortEditors = (editors: EditorUser[]): EditorUser[] => {
  return [...editors].sort((a, b) => {
    const aIsAnonymous = a.id.startsWith(GUID_EMPTY);
    const bIsAnonymous = b.id.startsWith(GUID_EMPTY);

    if (aIsAnonymous !== bIsAnonymous) return aIsAnonymous ? 1 : -1;

    return a.name.localeCompare(b.name);
  });
};

export const useEditorsData = ({
  activeEditors,
  editingBy,
  currentUserId,
}: UseEditorsDataProps): UseEditorsDataReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const editors = useMemo(
    () =>
      sortEditors(createEditorsArray(activeEditors, editingBy, currentUserId)),
    [activeEditors, editingBy, currentUserId],
  );
  const editorIds = useMemo(
    () => editors.map((editor) => editor.id),
    [editors],
  );

  const photoQueries = useQueries({
    queries: editorIds.map((editorId) => ({
      queryKey: ["userPhoto", editorId],
      queryFn: () => getUserPhoto(editorId),
      enabled:
        isOpen && editorIds.length > 0 && !editorId.startsWith(GUID_EMPTY),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    })),
  });

  const editorsWithPhotos = useMemo(() => {
    return editors.map((editor, index) => {
      const photoQuery = photoQueries[index];
      const photo = photoQuery?.data as UserPhoto | undefined;

      return {
        ...editor,
        photo: photo || null,
      };
    });
  }, [editors, photoQueries]);

  const openTooltip = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTooltip = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    editors: editorsWithPhotos,
    isOpen,
    openTooltip,
    closeTooltip,
    setIsOpen,
  };
};
