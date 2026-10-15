/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { request } from "@docspace/shared/api/client";
import {
  createAIChatAttachments,
  deleteAIChatAttachment,
} from "@docspace/shared/api/ai";
import { getFileInfo, getPresignedUri } from "@docspace/shared/api/files";
import type { TFile } from "@docspace/shared/api/files/types";
import { getOnlyofficeFileType } from "@onlyoffice/apps-ui-kit/ai-agent/providers/files/file-type";
import type { TSelectedFileInfo } from "@onlyoffice/apps-ui-kit/selectors/Files/FilesSelector.types";

// Attaching files to the editor AI plugin's chat ("+" → "Add local file" /
// "Add file from storage"). The plugin can reach neither the portal nor a text
// extractor, so it asks over this event; we answer the way DocSpace's own AI
// chat attaches files: images inline as a data URL, documents as the text the
// AI service extracts from the stored file. A local document is stored in
// My documents first, as the chat's "Upload from device" does. The chat asks
// what we support with a "query" when it opens. Messages come straight from
// the plugin's chat frame by postMessage (see useAIAttachFile): the editor's
// plugin ↔ connector events need the Automation API license.
//
// plugin → us:  { id, type: "query" }
//               { id, type: "request", source: "storage" }
//               { id, type: "request", source: "local", name, base64 }
// us → plugin:  { id, type: "sources", sources: ["local", "storage"] }
//               { id, type: "picked", kind, name }   (storage, once chosen)
//               { id, type: "file", kind: "image", name, base64 }
//               { id, type: "file", kind: "file", name, content }
//               { id, type: "cancel" } | { id, type: "error", error }
export const AI_ATTACH_FILE_CHANNEL = "onlyoffice-ai-attach-file";

// The image crosses three frames inline as a data URL.
const MAX_IMAGE_SIZE = 20 * 1024 * 1024;

const IMAGE_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".ico": "image/x-icon",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

type TPickedFile = NonNullable<TSelectedFileInfo>;

const getExtension = (title: string) => {
  const dot = title.lastIndexOf(".");
  return dot >= 0 ? title.slice(dot).toLowerCase() : "";
};

const isImage = (title: string) => getExtension(title) in IMAGE_MIME_TYPES;

// The selector may hand the title over without its extension, which then
// sits in `fileExst` ("sign" + ".png"); everything below goes by the full name.
const getFileName = (file: TPickedFile) => {
  const raw = file.fileExst ?? "";
  const ext = raw && !raw.startsWith(".") ? `.${raw}` : raw;
  return ext && !file.title.toLowerCase().endsWith(ext.toLowerCase())
    ? file.title + ext
    : file.title;
};

const readAsDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const downloadStorageImage = async (file: TPickedFile, fileName: string) => {
  // `viewUrl` is the browser download link on the portal itself; the
  // presigned one is meant for the document server and may not be
  // reachable from here.
  const info = await getFileInfo(file.id);
  const url = info?.viewUrl ?? (await getPresignedUri(file.id)).url;

  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);

  const blob = await response.blob();
  if (blob.size === 0) throw new Error("The image is empty");
  if (blob.size > MAX_IMAGE_SIZE) throw new Error("The image is too large");

  // The download is often served as application/octet-stream; the
  // extension decides then, so the data URL carries a real image type.
  const type = blob.type.startsWith("image/")
    ? blob.type
    : IMAGE_MIME_TYPES[getExtension(fileName)];

  return readAsDataUrl(
    type === blob.type ? blob : new Blob([blob], { type }),
  );
};

// The text the AI service extracts from a stored file. The attachment record
// it creates on the way is only a draft of a chat we are not, so it goes.
const extractText = async (file: { id: number | string; title: string }) => {
  const [attachment] = await createAIChatAttachments([
    { id: file.id, title: file.title, type: getOnlyofficeFileType(file.title) },
  ]);

  if (attachment?.id) {
    deleteAIChatAttachment(attachment.id).catch(() => {});
  }
  if (!attachment?.content) {
    throw new Error(`No text extracted from '${file.title}'`);
  }

  return attachment.content;
};

const uploadToMyDocuments = async (name: string, dataUrl: string) => {
  const blob = await (await fetch(dataUrl)).blob();

  const formData = new FormData();
  formData.append("File", new File([blob], name, { type: blob.type }));
  formData.append("Title", name);
  formData.append("CreateNewIfExist", "true");

  const uploaded = (await request({
    method: "post",
    url: "/files/@my/insert",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  })) as TFile | undefined;

  if (!uploaded?.id) throw new Error(`Upload of '${name}' failed`);

  return { id: uploaded.id, title: uploaded.title ?? name };
};

const handleAIAttachFile = async (
  reply: (data: Record<string, unknown>) => void,
  e: unknown,
  pickFile: () => Promise<TSelectedFileInfo | null>,
) => {
  const { id, type, source, name, base64 } = (e ?? {}) as Record<
    string,
    unknown
  >;
  // Only queries and requests: anything else on the event is an answer going
  // the other way.
  if (typeof id !== "string") return;

  const send = (data: Record<string, unknown>) => reply({ id, ...data });

  if (type === "query") {
    send({ type: "sources", sources: ["local", "storage"] });
    return;
  }
  if (type !== "request") return;

  try {
    if (source === "storage") {
      const file = await pickFile();
      if (!file) {
        send({ type: "cancel" });
        return;
      }

      const fileName = getFileName(file);
      const kind = isImage(fileName) ? "image" : "file";
      send({ type: "picked", kind, name: fileName });

      if (kind === "image") {
        const dataUrl = await downloadStorageImage(file, fileName);
        send({ type: "file", kind, name: fileName, base64: dataUrl });
      } else {
        const content = await extractText({ id: file.id, title: fileName });
        send({ type: "file", kind, name: fileName, content });
      }
      return;
    }

    if (source === "local") {
      if (typeof name !== "string" || typeof base64 !== "string") {
        throw new Error("No file in the request");
      }

      // The plugin reads images itself; one that comes anyway goes back as is.
      if (isImage(name)) {
        send({ type: "file", kind: "image", name, base64 });
        return;
      }

      const uploaded = await uploadToMyDocuments(name, base64);
      const content = await extractText(uploaded);
      send({ type: "file", kind: "file", name, content });
      return;
    }

    throw new Error(`Unsupported source: ${String(source)}`);
  } catch (err) {
    console.error("[doceditor] AI attach file failed", err);
    send({ type: "error", error: String(err) });
  }
};

export default handleAIAttachFile;
