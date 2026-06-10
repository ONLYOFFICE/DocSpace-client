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

import type { useStores } from "@docspace/ui-kit/ai-agent/providers";

type AttachmentsStore = ReturnType<typeof useStores>["useAttachmentsStore"];

export type AttachFileInput = {
  // DocSpace entryId; the AI backend resolves the record server-side.
  path: string;
  title: string;
  // ONLYOFFICE c_oAscFileType code (see getOnlyofficeFileType).
  type: number;
  content: string;
};

/**
 * Attaches DocSpace files to the AI chat composer through the attachments
 * store, then re-keys the refs flagged in `imageIndices` to
 * `attachmentImages`. The library hardcodes `kind: "file"` for refs produced
 * by `addAttachmentFile` even when the backend resolved an image, so without
 * this the chip would show the unknown-format icon instead of a preview.
 *
 * `imageIndices` are positions into `inputs`; the matching freshly-added refs
 * are moved (added refs preserve input order).
 */
export const attachFilesToChat = async (
  useAttachmentsStore: AttachmentsStore,
  inputs: AttachFileInput[],
  imageIndices: Set<number>,
): Promise<void> => {
  if (inputs.length === 0) return;

  const before = useAttachmentsStore.getState().attachmentFiles.length;

  await useAttachmentsStore.getState().addAttachmentFile(inputs);

  if (imageIndices.size === 0) return;

  useAttachmentsStore.setState((s) => {
    const added = s.attachmentFiles.slice(before);
    const stayingFiles = s.attachmentFiles.slice(0, before);
    const movedImages: typeof s.attachmentImages = [];
    added.forEach((ref, i) => {
      if (imageIndices.has(i)) {
        movedImages.push({ ...ref, kind: "image" });
      } else {
        stayingFiles.push(ref);
      }
    });
    return {
      attachmentFiles: stayingFiles,
      attachmentImages: [...s.attachmentImages, ...movedImages],
    };
  });
};
