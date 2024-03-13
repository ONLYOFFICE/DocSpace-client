import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { createFile, fileCopyAs } from "@/utils/actions";

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
};

async function Page({ searchParams }: { searchParams: TSearchParams }) {
  const hdrs = headers();

  const host = hdrs.get("x-forwarded-host");
  const proto = hdrs.get("x-forwarded-proto");
  const port = hdrs.get("x-forwarded-port");

  const baseURL = `${proto}://${host}${port ? `:${port}` : ""}`;

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
  } = searchParams;

  if (!parentId || !fileTitle) redirect(baseURL);

  const fileInfo = {
    title: fileTitle,
    extension: fileTitle.split(".").pop(),
    templateId,
    parentId,
    id,
    open,
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

    const redirectURL = `${baseURL}/doceditor/?fileId=${file.id}`;

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

    const redirectURL = `${baseURL}/doceditor/?fileId=${file.id}`;

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

  const redirectURL = `${baseURL}/doceditor/?fileId=${file.id}`;

  redirect(redirectURL);
}

export default Page;
