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

import { FC, useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import AIReactSvg from "PUBLIC_DIR/images/icons/16/AI.svg";

import { FolderType } from "@docspace/ui-kit/enums";
import { useIsDesktop } from "@docspace/ui-kit/hooks/use-is-desktop";
import { Button, ButtonSize, toastr } from "@docspace/ui-kit/components";

import { getFileInfo } from "@docspace/shared/api/files";
import { createLoader } from "@docspace/shared/utils/createLoader";

type ExternalAnalyzeResponsesProps = { className: string };

type AnalyzeResponsesProps = ExternalAnalyzeResponsesProps & {
  selectedFolder: ReturnType<
    TStore["selectedFolderStore"]["getSelectedFolder"]
  >;
  askAI: TStore["contextOptionsStore"]["askAI"];
};

const AnalyzeResponsesButtonComponent = ({
  selectedFolder,
  className,
  askAI,
}: AnalyzeResponsesProps) => {
  const { t } = useTranslation("Files");
  const isDesktopView = useIsDesktop();
  const [isLoading, setIsLoading] = useState(false);

  if (
    !isDesktopView ||
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
      await askAI(file);
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
>(({ selectedFolderStore, contextOptionsStore }) => {
  const selectedFolder = selectedFolderStore.getSelectedFolder();
  const askAI = contextOptionsStore.askAI;

  return { selectedFolder, askAI };
})(
  observer(
    AnalyzeResponsesButtonComponent as FC<ExternalAnalyzeResponsesProps>,
  ),
);
