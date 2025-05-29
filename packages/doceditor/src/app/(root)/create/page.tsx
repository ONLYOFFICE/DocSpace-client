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

import { permanentRedirect, redirect, RedirectType } from "next/navigation";
import dynamic from "next/dynamic";
import { headers } from "next/headers";

import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";
import { EditorConfigErrorType } from "@docspace/shared/enums";

import { createFile, fileCopyAs, getEditorUrl } from "@/utils/actions";
import { logger } from "@/../logger.mjs";

const Editor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
});
const CreateFileError = dynamic(() => import("@/components/CreateFileError"), {
  ssr: false,
});

const log = logger.child({ module: "Create page" });

type TSearchParams = {
  parentId: string;
  fileTitle: string;
  templateId?: string;
  formId?: string;
  id?: string;
  share?: string;
  password?: string;
  open?: string;
  fromFile?: string;
  fromTemplate?: string;
  action?: string;
  toForm?: string;
};

async function Page({ searchParams }: { searchParams: TSearchParams }) {
  const baseURL = getBaseUrl();

  if (!searchParams) {
    log.debug("Empty search params at create file");
    redirect(baseURL);
  }

  const {
    parentId,
    fileTitle,
    id,
    open,
    password,

    fromFile,
    templateId,

    fromTemplate,
    formId,
    action,
    toForm,
    share,
  } = searchParams;

  if (!parentId || !fileTitle) redirect(baseURL);

  const fileInfo = {
    title: fileTitle,
    extension: fileTitle.split(".").pop(),
    templateId,
    parentId,
    id,
    open,
    action,
    password,
  };

  const hdrs = headers();

  const hostname = hdrs.get("x-forwarded-host");

  log.info(
    { fileTitle, parentId, templateId, open, action, url: hostname },
    "Create new file",
  );

  let fileId = undefined;
  let fileError: Error | undefined = undefined;

  if (!templateId && fromFile) {
    log.debug(
      { fileTitle, parentId, templateId, open, action },
      "Empty templateId for create file from other file",
    );

    redirect(baseURL);
  }

  log.debug(
    { fileTitle, parentId, templateId, open, action },
    "Start create file",
  );

  const res =
    fromFile && templateId
      ? await fileCopyAs(
          templateId,
          fileTitle,
          parentId,
          false,
          password,
          toForm,
        )
      : await createFile(parentId, fileTitle, templateId, formId);

  if (!res) {
    log.error(
      { fileTitle, parentId, templateId, open, action },
      "File create failed, open empty editor",
    );
    const documentServerUrl = await getEditorUrl();

    return (
      <Editor documentServerUrl={documentServerUrl?.docServiceUrl ?? ""} />
    );
  }

  const { file, error } = res;

  if (!file) {
    fileError = error as unknown as Error;
  }

  if (file?.id) fileId = file.id;

  if (
    error &&
    typeof error !== "string" &&
    (error.statusCode === 403 ||
      error.type === EditorConfigErrorType.TenantQuotaException)
  ) {
    const documentServerUrl = await getEditorUrl();

    log.debug(
      { fileTitle, parentId, templateId, open, action, error },
      "Open empty editor",
    );

    return (
      <Editor
        documentServerUrl={documentServerUrl?.docServiceUrl ?? ""}
        errorMessage={error.message}
      />
    );
  }

  if (fileId || !fileError) {
    const searchParams = new URLSearchParams();

    searchParams.append("fileId", fileId?.toString() ?? "");
    if (action) {
      searchParams.append("action", action);
    }

    if (share) {
      searchParams.append("share", share);
    }

    log.debug(
      { fileTitle, parentId, fileId, searchParams },
      "File created success",
    );

    const redirectURL = `/?${searchParams.toString()}`;

    return redirect(redirectURL, RedirectType.replace);
  }

  log.error(
    { fileTitle, parentId, error: fileError, url: hostname },
    "File created error",
  );

  return (
    <CreateFileError
      error={fileError}
      fileInfo={fileInfo}
      fromFile={!!fromFile}
    />
  );
}

export default Page;
