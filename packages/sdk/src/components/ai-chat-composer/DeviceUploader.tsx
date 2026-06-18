// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { useStores } from "@docspace/ui-kit/ai-agent/providers";
import { toastr, type TData } from "@docspace/ui-kit/components/toast";

import { getOnlyofficeFileType } from "./onlyoffice-file-type";

export type DeviceUploaderHandle = { open: () => void };

// Mirrors `useChatDropAttachments` from @onlyoffice/ai-chat:
//   - image/* → readAsDataURL → addAttachmentImage
//   - text/*, application/json, empty mime → readAsText → addAttachmentFile (type=Unknown)
//   - anything else (DOCX/PDF/XLSX without host text extractor) → skipped with a toast
// Owns a hidden <input type="file" multiple>; the parent triggers the picker
// via the imperative `open()` handle attached through `React.forwardRef`.
const DeviceUploader = React.forwardRef<DeviceUploaderHandle>((_, ref) => {
  const { t } = useTranslation(["Common"]);
  const { useAttachmentsStore } = useStores();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useImperativeHandle(
    ref,
    () => ({
      open: () => {
        const el = inputRef.current;
        if (!el) return;
        // Reset so re-picking the same file fires onChange again.
        el.value = "";
        el.click();
      },
    }),
    [],
  );

  const onChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(e.target.files ?? []);
      if (picked.length === 0) return;

      const fileInputs: {
        path: string;
        content: string;
        type: number;
        title: string;
      }[] = [];
      const imageInputs: { name: string; base64: string }[] = [];
      const skipped: string[] = [];

      await Promise.all(
        picked.map(
          (f) =>
            new Promise<void>((resolve) => {
              const reader = new FileReader();
              reader.onerror = () => {
                skipped.push(f.name);
                resolve();
              };

              if (f.type.startsWith("image/")) {
                reader.onload = () => {
                  imageInputs.push({
                    name: f.name,
                    base64: String(reader.result ?? ""),
                  });
                  resolve();
                };
                reader.readAsDataURL(f);
                return;
              }

              const isTextish =
                f.type.startsWith("text/")
                || f.type === ""
                || f.type === "application/json";
              if (isTextish) {
                reader.onload = () => {
                  fileInputs.push({
                    // Empty path → raw-payload draft (not a DocSpace entry).
                    // Backend resolves the content from `content` directly
                    // once the raw-attachment path is wired up.
                    path: "",
                    content: String(reader.result ?? ""),
                    type: getOnlyofficeFileType(f.name),
                    title: f.name,
                  });
                  resolve();
                };
                reader.readAsText(f);
                return;
              }

              skipped.push(f.name);
              resolve();
            }),
        ),
      );

      if (skipped.length > 0) {
        toastr.error(
          t("Common:UnsupportedFileType", {
            files: skipped.join(", "),
            defaultValue: "Unsupported file type: {{files}}",
          }),
        );
      }

      try {
        const store = useAttachmentsStore.getState();
        if (fileInputs.length > 0) await store.addAttachmentFile(fileInputs);
        if (imageInputs.length > 0) await store.addAttachmentImage(imageInputs);
      } catch (err) {
        toastr.error(err as TData);
      }
    },
    [useAttachmentsStore, t],
  );

  return (
    <input
      ref={inputRef}
      type="file"
      multiple
      hidden
      onChange={onChange}
    />
  );
});
DeviceUploader.displayName = "DeviceUploader";

export default DeviceUploader;
