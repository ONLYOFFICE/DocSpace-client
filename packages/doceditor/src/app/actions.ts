"use server";
import { cookies, headers } from "next/headers";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/model/config";

export async function getData(
  fileId: string
  //fileVersion: string | undefined,
  //doc: string | undefined,
  //view: boolean,
  //shareKey: string | undefined
) {
  const token = cookies().get("asc_auth_key");

  const host = headers().get("x-forwarded-host");
  const proto = headers().get("x-forwarded-proto");

  let headersList = new Headers({
    "Content-Type": "application/json",
  });

  if (token?.value) {
    headersList.append("Authorization", token.value);
  }

  const res = await fetch(
    `${proto}://${host}/api/2.0/files/file/${fileId}/openedit`,
    {
      headers: headersList,
    }
  );

  const { response } = await res.json();

  return response as IConfig;
}
