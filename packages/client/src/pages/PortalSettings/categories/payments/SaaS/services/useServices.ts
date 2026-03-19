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

import {
  AI_ENUM,
  AI_TOOLS,
  BACKUP_SERVICE,
  DISK_STORAGE,
  STORAGE_ENUM,
} from "@docspace/shared/constants";
import { toastr } from "@docspace/ui-kit/components/toast";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import ServicesStore from "SRC_DIR/store/ServicesStore";

export type UseServicesProps = {
  servicesInit?: ServicesStore["servicesInit"];
  initServiceData?: ServicesStore["initServiceData"];
};

const useServices = ({ servicesInit, initServiceData }: UseServicesProps) => {
  const { t } = useTranslation(["Payments", "Services", "Common"]);

  const getServicesData = useCallback(async () => {
    try {
      await servicesInit?.(t);
    } catch (error) {
      console.error(error);
      toastr.error(t("Common:UnexpectedError"));
    }
  }, [servicesInit]);

  const getServiceData = useCallback(
    async (serviceName: string, serviceEnum?: string) => {
      try {
        await initServiceData?.(t, serviceName, serviceEnum);
      } catch (error) {
        console.error(error);
        toastr.error(t("Common:UnexpectedError"));
      }
    },
    [initServiceData],
  );

  const getServicesInitialValue = React.useCallback(async () => {
    const { pathname } = window.location;
    const actions: Promise<void>[] = [];

    if (
      pathname.includes("services") &&
      !pathname.includes("ai-services") &&
      !pathname.includes("backup") &&
      !pathname.includes("disk-storage")
    )
      actions.push(getServicesData());

    if (pathname.includes("ai-services"))
      actions.push(getServiceData(AI_TOOLS, AI_ENUM));

    if (pathname.includes("backup"))
      actions.push(getServiceData(BACKUP_SERVICE));

    if (pathname.includes("disk-storage"))
      actions.push(getServiceData(DISK_STORAGE, STORAGE_ENUM));

    await Promise.all(actions);
  }, [getServicesData, getServiceData]);

  return {
    getServicesInitialValue,
  };
};

export default useServices;
