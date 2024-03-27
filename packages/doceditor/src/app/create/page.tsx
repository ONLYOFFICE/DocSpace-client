// (c) Copyright Ascensio System SIA 2009-2024
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

import { redirect } from "next/navigation";

import { createFile, fileCopyAs, getBaseUrl } from "@/utils/actions";

import { combineUrl } from "@docspace/shared/utils/combineUrl";

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
};

async function Page({ searchParams }: { searchParams: TSearchParams }) {
  const baseURL = getBaseUrl();

  if (!searchParams) redirect(baseURL);

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

  let fileId = undefined;
  let fileError: Error | undefined = undefined;

  if (!templateId && fromFile) redirect(baseURL);

  const { file, error } =
    fromFile && templateId
      ? await fileCopyAs(templateId, fileTitle, parentId, false, password)
      : await createFile(parentId, fileTitle, templateId, formId);

  if (!file) {
    fileError = error as unknown as Error;
  }

  if (file?.id) fileId = file.id;

  if (fileId || !fileError) {
    const url = new URL(combineUrl(baseURL, `/doceditor/?fileId=${fileId}`));
    if (action) {
      url.searchParams.set("action", action);
    }

    const redirectURL = url.toString();

    console.log("redirectURL", redirectURL);

    return redirect(redirectURL);
  }

  return (
    <CreateFileError
      error={fileError}
      fileInfo={fileInfo}
      fromFile={!!fromFile}
      fromTemplate={!!fromTemplate}
    />
  );
}

export default Page;

