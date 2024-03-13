import type { Metadata } from "next";

import { getData } from "@/utils/actions";

import Root from "@/components/Root";

export const metadata: Metadata = {
  title: "Onlyoffice DocEditor page",

  description: "",
};

async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string };
}) {
  const {
    fileId,
    fileid,
    fileVersion: version,
    doc,
    action,
    share,
    editorType,
  } = searchParams || {
    fileId: undefined,
    fileid: undefined,
    fileVersion: undefined,
    doc: undefined,
    action: undefined,
    share: undefined,
    editorType: undefined,
  };

  const data = await getData(
    fileId ?? fileid,
    version,
    doc,
    action === "view",
    share,
    editorType,
  );

  return <Root {...data} />;
}

export default Page;
