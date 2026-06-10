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

import type { ComposerAction } from "@docspace/ui-kit/ai-agent/providers";
import { getBrandName } from "@docspace/shared/constants/brands";
import CatalogDocuments from "PUBLIC_DIR/images/icons/16/catalog.documents.react.svg";
import UploadIcon from "PUBLIC_DIR/images/icons/16/upload.react.svg";

import DocSpaceFilesAttachDialog from "./DocSpaceFilesAttachDialog";
import DeviceUploader, { type DeviceUploaderHandle } from "./DeviceUploader";
import styles from "./styles.module.scss";

export type UseAiChatComposerActionsResult = {
  // Pass to <AiAgentProviders composerActions={...} />.
  composerActions: ComposerAction[];
  // Render as children of <AiAgentProviders> — the picker dialog and the
  // hidden device <input> both read the AttachmentsStore via useStores(),
  // so they must live inside the provider's context.
  attachDialogs: React.ReactNode;
};

/**
 * Shared "add files" composer actions for the AI chat, reused by both the
 * (personal-files) docs chat panel and the (ai-agents) agent chat:
 *   - "Add files from {Product}" → opens a DocSpace FilesSelector picker
 *   - "Upload from device"       → opens a hidden file input
 *
 * Owns the picker visibility + the device uploader imperative handle, so the
 * caller only wires `composerActions` into the provider and renders
 * `attachDialogs` inside it.
 */
export const useAiChatComposerActions = (): UseAiChatComposerActionsResult => {
  const { t, i18n } = useTranslation(["Common"]);

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const closePicker = React.useCallback(() => setPickerVisible(false), []);

  const deviceUploaderRef = React.useRef<DeviceUploaderHandle>(null);

  const composerActions = React.useMemo<ComposerAction[]>(
    () => [
      {
        id: "add-files-from-docspace",
        text: t("Common:AddFilesFromProduct", {
          productName: getBrandName("ProductName"),
          defaultValue: "Add files from {{productName}}",
        }),
        icon: <CatalogDocuments className={styles.composerActionIcon} />,
        onClick: () => setPickerVisible(true),
      },
      {
        id: "upload-from-device",
        text: t("Common:UploadFromDevice", {
          defaultValue: "Upload from device",
        }),
        icon: <UploadIcon className={styles.composerActionIcon} />,
        onClick: () => deviceUploaderRef.current?.open(),
      },
    ],
    [t, i18n.language],
  );

  const attachDialogs = (
    <>
      {pickerVisible ? (
        <DocSpaceFilesAttachDialog onClose={closePicker} />
      ) : null}
      <DeviceUploader ref={deviceUploaderRef} />
    </>
  );

  return { composerActions, attachDialogs };
};

export default useAiChatComposerActions;
