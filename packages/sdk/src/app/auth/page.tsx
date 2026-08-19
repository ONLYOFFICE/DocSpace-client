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

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getBgPattern } from "@docspace/shared/utils/common";
import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";

import { getColorTheme } from "@/api/settings";
import AuthClient from "./AuthClient";
import CreatePortalClient from "./CreatePortalClient";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { providerName, successRedirectURL, inviteKey, emplType } = params;

  if (!providerName) {
    return <div>Missing providerName parameter</div>;
  }

  const cookieStore = await cookies();
  const hasAuth = !!cookieStore.get("asc_auth_key");

  if (hasAuth && successRedirectURL && providerName !== "createPortal") {
    redirect(successRedirectURL);
  }

  const colorTheme = await getColorTheme();
  const bgPattern = getBgPattern(colorTheme?.selected);

  const definedParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined),
  ) as Record<string, string>;
  const confirmParams = new URLSearchParams(definedParams);
  if (confirmParams.has("inviteKey")) {
    confirmParams.set("key", confirmParams.get("inviteKey")!);
    confirmParams.delete("inviteKey");
  }
  const confirmHeader = confirmParams.toString();

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div
        style={{
          backgroundImage: bgPattern,
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          position: "fixed",
          inset: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <FormWrapper id="auth-form">
          {providerName === "createPortal" ? (
            <CreatePortalClient />
          ) : (
            <AuthClient
              providerName={providerName}
              successRedirectURL={successRedirectURL ?? null}
              inviteKey={inviteKey ?? null}
              emplType={emplType ?? null}
              confirmHeader={confirmHeader}
            />
          )}
        </FormWrapper>
      </div>
    </div>
  );
}

