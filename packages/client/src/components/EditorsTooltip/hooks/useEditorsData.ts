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
