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

import { redirect, RedirectType } from "next/navigation";
import { headers } from "next/headers";

import { getBaseUrl } from "@docspace/shared/utils/next-ssr-helper";
import { EditorConfigErrorType } from "@docspace/shared/enums";

import { createFile, fileCopyAs, getEditorUrl } from "@/utils/actions";
import { logger } from "@/../logger.mjs";
import Editor from "@/components/Editor";
import CreateFileError from "@/components/CreateFileError";

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
  editorGoBack?: string;
  withoutGoBackText?: string;
};

async function Page(props: { searchParams: Promise<TSearchParams> }) {
  const { searchParams: sp } = props;
  const searchParams = await sp;
  const baseURL = await getBaseUrl();

  if (!searchParams) {
    logger.debug("Empty search params at create file");
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

    formId,
    action,
    toForm,
    share,
    editorGoBack,
    withoutGoBackText,
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

  const hdrs = await headers();

  const hostname = hdrs.get("x-forwarded-host");

  logger.info(
    `fileTitle: ${fileTitle}, parentId: ${parentId}, templateId: ${templateId}, open: ${open}, action: ${action}, url: ${hostname} Create new file`,
  );

  let fileId = 0;
  let fileError: Error | undefined;

  if (!templateId && fromFile) {
    logger.debug(
      `fileTitle: ${fileTitle}, parentId: ${parentId}, templateId: ${templateId}, open: ${open}, action: ${action}, Empty templateId for create file from other fil`,
    );

    redirect(baseURL);
  }

  logger.debug(
    `fileTitle: ${fileTitle}, parentId: ${parentId}, templateId: ${templateId}, open: ${open}, action: ${action}, Start create file`,
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
    logger.error(
      `fileTitle: ${fileTitle}, parentId: ${parentId}, templateId: ${templateId}, open: ${open}, action: ${action}, File create failed, open empty editor`,
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

    logger.debug(
      `fileTitle: ${fileTitle}, parentId: ${parentId}, templateId: ${templateId}, open: ${open}, action: ${action}, error: ${JSON.stringify(error)}, Open empty editor`,
    );

    return (
      <Editor
        documentServerUrl={documentServerUrl?.docServiceUrl ?? ""}
        errorMessage={error.message}
      />
    );
  }

  if (fileId || !fileError) {
    const newSearchParams = new URLSearchParams();

    newSearchParams.append("fileId", fileId?.toString() ?? "");
    if (action) {
      newSearchParams.append("action", action);
    }

    if (share) {
      newSearchParams.append("share", share);
    }

    if (editorGoBack) {
      newSearchParams.append("editorGoBack", editorGoBack);
    }

    if (withoutGoBackText) {
      newSearchParams.append("withoutGoBackText", withoutGoBackText);
    }

    logger.debug(
      `fileTitle: ${fileTitle}, parentId: ${parentId}, fileId: ${fileId}, searchParams: ${newSearchParams}, File created success`,
      "File created success",
    );

    const redirectURL = `/?${newSearchParams.toString()}`;

    return redirect(redirectURL, RedirectType.replace);
  }

  logger.error(
    `fileTitle: ${fileTitle}, parentId: ${parentId}, error: ${fileError}, url: ${hostname}, File created error`,
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
