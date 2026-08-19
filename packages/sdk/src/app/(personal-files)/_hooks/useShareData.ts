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

import React from "react";

import {
  getExternalFolderLinks,
  getExternalLinks,
} from "@docspace/shared/api/files";
import type { TFile, TFileLink, TFolder } from "@docspace/shared/api/files/types";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";

interface UseShareDataProps {
  selection: TFile | TFolder | null;
}

interface UseShareDataResult {
  filesLink: TFileLink[] | undefined;
}

/**
 * Loads initial share links for the Share panel.
 * Creates a primary link first if the item isn't shared yet,
 * then fetches the full link list.
 *
 * Returns `undefined` while loading so that useShare waits
 * instead of doing its own fetchLinks in parallel.
 * After the initial load it never updates filesLink again,
 * so external re-renders can't clobber useShare's internal state
 * while the user is working with links.
 */
export const useShareData = ({
  selection,
}: UseShareDataProps): UseShareDataResult => {
  // undefined = still loading; [] or [...] = loaded (never changes afterwards)
  const [filesLink, setFilesLink] = React.useState<TFileLink[] | undefined>(
    undefined,
  );

  // Track which selection id we already loaded so we don't reload on re-renders
  const loadedForId = React.useRef<number | string | null>(null);

  React.useEffect(() => {
    if (!selection) {
      setFilesLink(undefined);
      loadedForId.current = null;
      return;
    }

    // Already loaded for this item — don't reload
    if (loadedForId.current === selection.id) return;

    let cancelled = false;

    const load = async () => {
      try {
        if (!selection.shared && selection.canShare) {
          await ShareLinkService.getPrimaryLink(selection);
        }

        const getLinks = selection.isFolder
          ? getExternalFolderLinks
          : getExternalLinks;

        const res = await getLinks(String(selection.id), 0, 50);

        if (!cancelled) {
          loadedForId.current = selection.id;
          setFilesLink(res.items);
        }
      } catch (error) {
        console.error("Error loading share data:", error);
        if (!cancelled) setFilesLink([]);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [selection]);

  return { filesLink };
};
