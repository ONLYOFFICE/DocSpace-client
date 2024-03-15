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
  };

  let fileId = undefined;
  let fileError: Error | undefined = undefined;

  if (fromFile) {
    if (!templateId) redirect(baseURL);

    const { file, error } = await fileCopyAs(
      templateId,
      fileTitle,
      parentId,
      false,
      password,
    );

    if (!file) {
      fileError = error as unknown as Error;
    }

    if (file?.id) fileId = file.id;
  } else if (fromTemplate) {
    const { file, error } = await createFile(
      parentId,
      fileTitle,
      undefined,
      formId,
    );

    if (!file) {
      fileError = error as unknown as Error;
    }

    if (file?.id) fileId = file.id;
  } else {
    const { file, error } = await createFile(
      parentId,
      fileTitle,
      templateId,
      formId,
    );

    if (!file) {
      fileError = error as unknown as Error;
    }

    if (file?.id) fileId = file.id;
  }

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

