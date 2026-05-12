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

"use client";

import { useCallback, useEffect, useState } from "react";

import { DeviceType } from "@docspace/shared/enums";

type Options = {
  storageKey: string;
  currentDeviceType: DeviceType;
  /** Default for tablet when nothing is stored. */
  tabletDefault?: boolean;
};

const readSaved = (key: string, fallback: boolean): boolean => {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;
    return saved !== "false";
  } catch {
    return fallback;
  }
};

const writeSaved = (key: string, value: boolean) => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // localStorage unavailable (incognito/restricted)
  }
};

/**
 * Resolves and persists the sidebar's "show text" state.
 *
 * Rules:
 * - desktop: user-controlled, persisted in localStorage; defaults to true
 * - tablet:  user-controlled, persisted in localStorage; defaults to `tabletDefault`
 * - mobile:  always true (drawer is full-width)
 */
export const useSidebarShowText = ({
  storageKey,
  currentDeviceType,
  tabletDefault = false,
}: Options) => {
  const [showText, setShowText] = useState<boolean>(() => {
    if (currentDeviceType === DeviceType.mobile) return true;
    if (currentDeviceType === DeviceType.tablet)
      return readSaved(storageKey, tabletDefault);
    return readSaved(storageKey, true);
  });

  useEffect(() => {
    if (currentDeviceType === DeviceType.mobile) {
      setShowText(true);
    } else if (currentDeviceType === DeviceType.tablet) {
      setShowText(readSaved(storageKey, tabletDefault));
    } else {
      setShowText(readSaved(storageKey, true));
    }
  }, [currentDeviceType, storageKey, tabletDefault]);

  const toggleShowText = useCallback(() => {
    setShowText((prev) => {
      const next = !prev;
      writeSaved(storageKey, next);
      return next;
    });
  }, [storageKey]);

  return { showText, toggleShowText };
};
