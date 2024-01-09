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
  const { fileId } = searchParams || { fileId: undefined };

  if (!fileId) return redirect("/error");

  const config = await getData(fileId);

  return <Editor config={config} />;
}
