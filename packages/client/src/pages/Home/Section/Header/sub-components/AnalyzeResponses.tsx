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

import { FC, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import AIReactSvg from "PUBLIC_DIR/images/icons/16/AI.svg";

import { FolderType } from "@onlyoffice/apps-ui-kit/enums";
import { useIsDesktop } from "@onlyoffice/apps-ui-kit/hooks/use-is-desktop";
import { Button, ButtonSize, toastr } from "@onlyoffice/apps-ui-kit/components";

import { getFileInfo } from "@docspace/shared/api/files";
import { createLoader } from "@docspace/shared/utils/createLoader";

type ExternalAnalyzeResponsesProps = { className: string };

type AnalyzeResponsesProps = ExternalAnalyzeResponsesProps & {
  selectedFolder: ReturnType<
    TStore["selectedFolderStore"]["getSelectedFolder"]
  >;
  askAI: TStore["contextOptionsStore"]["askAI"];
  /** The chat is unavailable here whatever the folder's rights say. */
  noAi: boolean;
};

const AnalyzeResponsesButtonComponent = ({
  selectedFolder,
  className,
  askAI,
  noAi,
}: AnalyzeResponsesProps) => {
  const { t } = useTranslation("Files");
  const isDesktopView = useIsDesktop();
  const [isLoading, setIsLoading] = useState(false);

  if (
    !isDesktopView ||
    noAi ||
    selectedFolder.type !== FolderType.SubFolderDone ||
    !selectedFolder.originalFormId ||
    !(
      selectedFolder.security &&
      "AnalyzeResponses" in selectedFolder.security &&
      selectedFolder.security.AnalyzeResponses
    )
  )
    return;

  const onClick = async () => {
    const { startLoader, endLoader } = createLoader();
    try {
      const originalFormId = selectedFolder.originalFormId;

      if (!originalFormId) return;

      startLoader(() => setIsLoading(true));

      const file = await getFileInfo(originalFormId);
      // This button is the analyze action by definition — it only renders on
      // a results folder — so it says so instead of leaving the chat to infer
      // it from the fetched row: the form is attached as the subject of the
      // message and the composer takes nothing else.
      await askAI(file, true);
    } catch (error) {
      console.error(error);
      toastr.error(error as Error);
    } finally {
      endLoader(() => setIsLoading(false));
    }
  };

  const label = t("Files:AnalyzeResponses");

  return (
    <Button
      accent
      onClick={onClick}
      icon={<AIReactSvg />}
      className={className}
      isLoading={isLoading}
      size={ButtonSize.extraSmall}
      label={label}
      title={label}
    />
  );
};

export const AnalyzeResponsesButton = inject<
  TStore,
  FC<ExternalAnalyzeResponsesProps>,
  Omit<AnalyzeResponsesProps, keyof ExternalAnalyzeResponsesProps>
>(({
  selectedFolderStore,
  contextOptionsStore,
  settingsStore,
  treeFoldersStore,
  publicRoomStore,
}) => {
  const selectedFolder = selectedFolderStore.getSelectedFolder();
  const askAI = contextOptionsStore.askAI;

  return {
    selectedFolder,
    askAI,
    // `security.AnalyzeResponses` is computed when the folder is fetched, so
    // an open results folder keeps saying yes after an admin switches AI off
    // portal-wide. The signals the context menu checks are read here too
    // (`filesStore/contextOptions.helpers.ts`), because this button is the
    // same action: privacy rules the chat out whatever the rights say, and a
    // public room hides it altogether — otherwise a link visitor would reach
    // through this button what the menu denies them. Encryption is the one
    // signal that has no counterpart here: `TFolder` carries no such flag.
    noAi:
      !settingsStore.aiServicesEnabled ||
      treeFoldersStore.isPrivacyFolder ||
      selectedFolder.private ||
      publicRoomStore.isPublicRoom,
  };
})(
  observer(
    AnalyzeResponsesButtonComponent as FC<ExternalAnalyzeResponsesProps>,
  ),
);
