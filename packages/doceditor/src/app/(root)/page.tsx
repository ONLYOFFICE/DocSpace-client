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

import { cookies, headers } from "next/headers";
import Script from "next/script";

import { getSelectorsByUserAgent } from "react-device-detect";

import { ValidationStatus } from "@docspace/shared/enums";

import {
  getData,
  validatePublicRoomKey,
  getDeepLinkSettings,
} from "@/utils/actions";
import { logger } from "@/../logger.mjs";

import { RootPageProps } from "@/types";
import Root from "@/components/Root";
import FilePassword from "@/components/file-password";
import { TFrameConfig } from "@docspace/shared/types/Frame";

const initialSearchParams: Awaited<RootPageProps["searchParams"]> = {
  fileId: undefined,
  fileid: undefined,
  version: undefined,
  doc: undefined,
  action: undefined,
  share: undefined,
  editorType: undefined,
};

async function Page(props: RootPageProps) {
  const { searchParams: sp } = props;
  const searchParams = await sp;
  const {
    fileId,
    fileid,
    version,
    doc,
    action,
    share,
    editorType,
    error,
    locale,
    theme,
    is_file,
    editorGoBack,
    isSDK,
  } = searchParams ?? initialSearchParams;

  const baseSdkConfig: TFrameConfig & { is_file?: boolean; isSDK?: boolean } = {
    frameId: "",
    mode: "",
    src: "",
    editorCustomization: { uiTheme: theme },
    editorGoBack,
    editorType,
    id: fileId,
    locale,
    requestToken: share,
    theme,
    is_file,
    isSDK,
  };

  const cookieStore = await cookies();
  const hdrs = await headers();

  const hostname = hdrs.get("x-forwarded-host");

  logger.info(
    `fileId: ${fileId ?? fileid}, action: ${action ?? "not set"}, isShare: ${!!share}, isAuth: ${!!cookieStore.get("asc_auth_key")?.value}, version: ${version ?? "not set"}, editorType: ${editorType ?? "not set"}, doc: ${doc ?? "not set"}, url: ${hostname} Start open file at edit`,
  );

  let type = editorType;

  const ua = hdrs.get("user-agent");
  if (ua && !type) {
    const { isMobile } = getSelectorsByUserAgent(ua);

    if (isMobile) {
      type = "mobile";

      logger.debug(
        `file: ${fileId ?? fileid}, isShare: ${!!share}, isAuth: ${!!cookieStore.get("asc_auth_key")?.value}, Open mobile view`,
      );
    }
  }

  logger.debug(
    `fileId: ${fileId ?? fileid}, isShare: ${!!share}, isAuth: ${!!cookieStore.get("asc_auth_key")?.value}, Start get data for open file`,
  );

  const data = await getData(
    fileId ?? fileid ?? "",
    version,
    doc,
    action,
    share,
    type,
  );

  if (data.error?.status === "access-denied" && share) {
    const roomData = await validatePublicRoomKey(share, fileId ?? fileid ?? "");
    if (!roomData) {
      logger.error(
        `fileId: ${fileId ?? fileid}, isShare: ${!!share}, isAuth: ${!!cookieStore.get("asc_auth_key")?.value}, Wrong share key`,
      );
      return;
    }
    const { status } = roomData.response;

    if (status === ValidationStatus.Password) {
      logger.debug(
        `fileId: ${fileId ?? fileid}, isShare: ${!!share}, isAuth: ${!!cookieStore.get("asc_auth_key")?.value}, Open file password component`,
      );
      return (
        <FilePassword validationData={roomData.response} shareKey={share} />
      );
    }
  }

  const deepLinkSettings = isSDK ? null : await getDeepLinkSettings();

  if (data.error?.status === "not-found" && error) {
    data.error.message = error;
  }

  let url = data.config?.editorUrl ?? data.error?.editorUrl;
  const urlQuery = url?.includes("?") ? `?${url.split("?")[1]}` : "";
  url = url?.replace(urlQuery, "");

  if (url && !url.endsWith("/")) url += "/";

  const docApiUrl = `${url}web-apps/apps/api/documents/api.js${urlQuery}`;

  if (isSDK) {
    delete data.config?.editorConfig?.embedded?.embedUrl;
    delete data.config?.editorConfig?.embedded?.shareUrl;
  }

  if (urlQuery) {
    if (data.config?.editorUrl) {
      data.config.editorUrl = data.config?.editorUrl.replace(urlQuery, "");
    }

    if (data.error?.editorUrl) {
      data.error.editorUrl = data.config?.editorUrl.replace(urlQuery, "");
    }
  }

  logger.debug(
    `fileId: ${fileId ?? fileid}, isShare: ${!!share}, isAuth: ${!!cookieStore.get("asc_auth_key")?.value}, docApiUrl: ${docApiUrl}, url: ${hostname} Open file`,
  );

  return (
    <>
      {url ? (
        <Script
          id="onlyoffice-api-script"
          strategy="beforeInteractive"
          src={docApiUrl}
        />
      ) : null}
      <Root
        {...data}
        shareKey={share}
        baseSdkConfig={baseSdkConfig}
        deepLinkSettings={deepLinkSettings?.handlingMode}
      />
    </>
  );
}

export default Page;
