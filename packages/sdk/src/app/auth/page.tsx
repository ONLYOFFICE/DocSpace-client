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

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getBgPattern } from "@docspace/shared/utils/common";
import { FormWrapper } from "@docspace/ui-kit/components/form-wrapper";

import { getColorTheme } from "@/api/settings";
import AuthClient from "./AuthClient";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { providerName, redirectURL, key, emplType } = params;

  if (!providerName) {
    return <div>Missing providerName parameter</div>;
  }

  const cookieStore = await cookies();
  const hasAuth = !!cookieStore.get("asc_auth_key");

  if (hasAuth && redirectURL) {
    redirect(redirectURL);
  }

  const colorTheme = await getColorTheme();
  const bgPattern = getBgPattern(colorTheme?.selected);

  const confirmHeader = new URLSearchParams(
    params as Record<string, string>,
  ).toString();

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
          <AuthClient
            providerName={providerName}
            redirectURL={redirectURL ?? null}
            inviteKey={key ?? null}
            emplType={emplType ?? null}
            confirmHeader={confirmHeader}
          />
        </FormWrapper>
      </div>
    </div>
  );
}
