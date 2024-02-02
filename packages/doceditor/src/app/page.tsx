import { redirect } from "next/navigation";
import type { Metadata } from "next";

import Editor from "@/components/Editor";
import { getData } from "@/utils/actions";

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

  const data = await getData(fileId, version, doc, action === "view", share);

  return <Editor {...data} />;
}

export default Page;
