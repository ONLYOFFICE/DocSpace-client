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

import { headers } from "next/headers";

import ConfirmRoute from "@/components/ConfirmRoute";
import { StyledBody } from "@/components/Confirm.styled";
import { TConfirmLinkParams } from "@/types";
import { checkConfirmLink, getSettings, getUser } from "@/utils/actions";
import { ValidationResult } from "@/utils/enums";
import { redirect } from "next/navigation";
import { logger } from "logger.mjs";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  logger.info("Confirm layout");

  const hdrs = await headers();
  const searchParams = hdrs.get("x-confirm-query") ?? "";
  const type = hdrs.get("x-confirm-type") ?? "";
  const hostName = hdrs.get("x-forwarded-host") ?? "";
  const proto = hdrs.get("x-forwarded-proto");

  const queryParams = Object.fromEntries(
    new URLSearchParams(searchParams.toString()),
  ) as TConfirmLinkParams;

  const confirmLinkParams: TConfirmLinkParams = {
    type,
    ...queryParams,
  };

  const [settings, confirmLinkResult] = await Promise.all([
    getSettings(),
    checkConfirmLink(confirmLinkParams),
  ]);

  const user = type === "GuestShareLink" ? await getUser() : undefined;

  const isUserExisted =
    confirmLinkResult?.result == ValidationResult.UserExisted;
  const isUserExcluded =
    confirmLinkResult?.result == ValidationResult.UserExcluded;
  const objectSettings = typeof settings === "string" ? undefined : settings;

  if (isUserExisted) {
    const finalUrl = confirmLinkResult?.roomId
      ? `${proto}://${hostName}/rooms/shared/${confirmLinkResult?.roomId}/filter?folder=${confirmLinkResult?.roomId}`
      : objectSettings?.defaultPage;

    logger.info("Confirm layout UserExisted");

    redirect(finalUrl ?? "/");
  }

  if (isUserExcluded) {
    logger.info("Confirm layout UserExcluded");

    redirect(objectSettings?.defaultPage ?? "/");
  }

  return (
    <StyledBody id="confirm-body">
      <ConfirmRoute
        socketUrl={objectSettings?.socketUrl}
        confirmLinkResult={confirmLinkResult}
        confirmLinkParams={confirmLinkParams}
        user={user}
      >
        {children}
      </ConfirmRoute>
    </StyledBody>
  );
}
