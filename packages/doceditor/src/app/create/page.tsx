import { redirect } from "next/navigation";

import { createFile, fileCopyAs, getBaseUrl } from "@/utils/actions";
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
    const redirectURL = `${baseURL}/doceditor/?fileId=${fileId}`;

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
