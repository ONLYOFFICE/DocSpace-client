import Editor from "@/components/Editor";
// import {
//   openEdit,
//   // getSettingsFiles,
//   // getShareFiles,
// } from "@docspace/common/api/editor";

import { getData } from "./actions";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
}) {
  const {
    fileId,
    fileVersion: version,
    doc,
    action,
    share,
  } = searchParams || {
    fileId: undefined,
    fileVersion: undefined,
    doc: undefined,
    action: undefined,
    share: undefined,
  };

  if (!fileId) return redirect("/error");

  const config = await getData(fileId, version, doc, action === "view", share);

  return <Editor config={config} />;
}
