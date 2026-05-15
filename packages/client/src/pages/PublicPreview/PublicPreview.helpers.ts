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
import { AxiosError } from "axios";
import { isMobile } from "react-device-detect";
import { redirect, LoaderFunctionArgs, redirectDocument } from "react-router";
import { useState, useEffect, useCallback } from "react";

import { getDeviceTypeByWidth } from "@docspace/shared/utils";
import { DeviceType, ValidationStatus } from "@docspace/shared/enums";
import { validatePublicRoomKey } from "@docspace/shared/api/rooms";
import { getSettingsFiles } from "@docspace/shared/api/files";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

export const useDeviceType = () => {
  const [currentDeviceType, setCurrentDeviceType] = useState<DeviceType>(() =>
    getDeviceTypeByWidth(window.innerWidth),
  );

  const onResize = useCallback(() => {
    setCurrentDeviceType(getDeviceTypeByWidth(window.innerWidth));
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);

    if (isMobile) {
      if (window.screen.orientation) {
        window.screen.orientation.addEventListener("change", onResize);
      } else {
        window.addEventListener("orientationchange", onResize);
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.screen?.orientation?.removeEventListener("change", onResize);
    };
  }, [onResize]);

  return currentDeviceType;
};

export const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "isAxiosError" in error &&
    typeof error.isAxiosError === "boolean" &&
    error.isAxiosError
  );
};

export const publicPreviewLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const key = searchParams.get("share") || searchParams.get("key");

  if (!key) {
    return redirect("/");
  }

  const [validateData, settings] = await Promise.all([
    validatePublicRoomKey(key),
    getSettingsFiles(),
  ]);

  if (
    validateData?.status === ValidationStatus.Ok &&
    validateData?.isAuthenticated
  ) {
    return redirectDocument(`${MEDIA_VIEW_URL}${validateData.id}?key=${key}`);
  }

  return { validateData, key, settings };
};
