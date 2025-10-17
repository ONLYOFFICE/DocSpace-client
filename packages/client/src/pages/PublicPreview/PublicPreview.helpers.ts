// (c) Copyright Ascensio System SIA 2009-2025
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
