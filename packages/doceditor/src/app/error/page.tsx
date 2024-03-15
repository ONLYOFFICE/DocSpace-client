import CreateFileError from "@/components/CreateFileError";
import { getErrorData } from "@/utils/actions";

type TSearchParams = {
  error?: string;
  fileInfo?: string;
  createFile?: string;
  fromFile?: string;
  fromTemplate?: string;
};

async function Page({ searchParams }: { searchParams: TSearchParams }) {
  const error = searchParams.error ? JSON.parse(searchParams.error) : "";
  const fileInfo = searchParams.fileInfo
    ? JSON.parse(searchParams.fileInfo)
    : "";
  const fromTemplate = searchParams.fromTemplate
    ? JSON.parse(searchParams.fromTemplate)
    : "";
  const fromFile = searchParams.fromFile
    ? JSON.parse(searchParams.fromFile)
    : "";

  console.log("searchParams here", searchParams);

  if (searchParams.createFile) {
    const { settings, user } = await getErrorData();

    return (
      <CreateFileError
        error={error}
        fileInfo={fileInfo}
        fromFile={!!fromFile}
        fromTemplate={!!fromTemplate}
        settings={settings}
        user={user}
      />
    );
  }

  return <div></div>;
}

export default Page;
