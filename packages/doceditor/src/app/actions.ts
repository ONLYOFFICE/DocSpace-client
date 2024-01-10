"use server";
import { cookies, headers } from "next/headers";
import IConfig from "@onlyoffice/document-editor-react/dist/esm/model/config";

const API_PREFIX = "api/2.0";

export async function getData(
  fileId: string,
  version?: string | undefined,
  doc?: string | undefined,
  view?: boolean | undefined,
  share?: string | undefined
) {
  //const token = cookies().get("asc_auth_key");

  const hdrs = headers();

  const host = hdrs.get("x-forwarded-host");
  const proto = hdrs.get("x-forwarded-proto");

  //let headersList = new Headers(hdrs);

  //   if (token?.value) {
  //     headersList.append("Authorization", token.value);
  //   }

  const baseAPIUrl = `${proto}://${host}/${API_PREFIX}`;

  const url = new URL(`${baseAPIUrl}/files/file/${fileId}/openedit`);

  view && url.searchParams.append("view", view ? "true" : "false");
  version && url.searchParams.append("version", version);
  doc && url.searchParams.append("doc", doc);
  share && url.searchParams.append("share", share);

  //console.log(url.toString());

  const req = new Request(url, {
    headers: hdrs,
  });

  const res = await fetch(req);

  if (!res.ok) throw new Error(res.statusText);

  const { response } = await res.json();

  return response as IConfig;
}
