import { redirect } from "next/navigation";

import { createFile, fileCopyAs, getBaseUrl } from "@/utils/actions";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

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

  if (fromFile) {
    if (!templateId) redirect(baseURL);

    const { file, error } = await fileCopyAs(
      templateId,
      fileTitle,
      parentId,
      false,
      password,
    );

    if (!file)
      return redirect(
        `${baseURL}?createError=${JSON.stringify(
          typeof error === "string"
            ? { error, fileInfo, fromFile: true, isString: true }
            : { ...error, fileInfo, fromFile: true },
        )}`,
      );

    const url = new URL(combineUrl(baseURL, `/doceditor/?fileId=${file.id}`));
    if (action) {
      url.searchParams.set("action", action);
    }

    const redirectURL = url.toString();

    console.log("redirectURL", redirectURL);

    return redirect(redirectURL);
  }

  if (fromTemplate) {
    if (!fromTemplate) redirect(baseURL);

    const { file, error } = await createFile(
      parentId,
      fileTitle,
      undefined,
      formId,
    );

    if (!file)
      return redirect(
        `${baseURL}?createError=${JSON.stringify(
          typeof error === "string"
            ? { error, fileInfo, fromTemplate: true, isString: true }
            : { ...error, fileInfo, fromTemplate: true },
        )}`,
      );

    const url = new URL(combineUrl(baseURL, `/doceditor/?fileId=${file.id}`));
    if (action) {
      url.searchParams.set("action", action);
    }

    const redirectURL = url.toString();

    console.log("redirectURL", redirectURL);

    return redirect(redirectURL);
  }

  const { file, error } = await createFile(
    parentId,
    fileTitle,
    templateId,
    formId,
  );

  if (!file)
    return redirect(
      `${baseURL}?createError=${JSON.stringify(
        typeof error === "string"
          ? { error, fileInfo, isString: true }
          : { ...error, fileInfo },
      )}`,
    );

  const url = new URL(combineUrl(baseURL, `/doceditor/?fileId=${file.id}`));
  if (action) {
    url.searchParams.set("action", action);
  }

  const redirectURL = url.toString();

  console.log("redirectURL", redirectURL);

  redirect(redirectURL);
}

export default Page;

