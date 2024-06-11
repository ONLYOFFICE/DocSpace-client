// (c) Copyright Ascensio System SIA 2009-2024
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

import { useState, useEffect } from "react";
import { objectToGetParams } from "@docspace/shared/utils/common";
import { Tabs, ThemeTabs } from "@docspace/shared/components/tabs";

import { CodeToInsert } from "./CodeToInsert";
import { GetCodeBlock } from "./GetCodeBlock";

import { Preview } from "../presets/StyledPresets";
import { showPreviewThreshold } from "../constants";

export const PreviewBlock = ({
  t,
  loadCurrentFrame,
  preview,
  theme,
  frameId,
  scriptUrl,
  config,
  isDisabled = false,
}) => {
  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );
  const params = objectToGetParams(config);

  const codeBlock = `<div id="${frameId}">Fallback text</div>\n<script src="${scriptUrl}${params}"></script>`;

  const code = (
    <CodeToInsert t={t} theme={theme} codeBlock={codeBlock} config={config} />
  );
  const dataTabs = [
    {
      id: "preview",
      name: t("Common:Preview"),
      content: preview,
    },
    {
      id: "code",
      name: t("Code"),
      content: code,
    },
  ];

  const onResize = () => {
    const isEnoughWidthForPreview = window.innerWidth > showPreviewThreshold;
    if (isEnoughWidthForPreview !== showPreview)
      setShowPreview(isEnoughWidthForPreview);
  };

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [showPreview]);

  return showPreview ? (
    <Preview>
      <Tabs
        theme={ThemeTabs.Secondary}
        onSelect={loadCurrentFrame}
        items={dataTabs}
        isDisabled={isDisabled}
      />
    </Preview>
  ) : (
    <GetCodeBlock t={t} codeBlock={codeBlock} isDisabled={isDisabled} />
  );
};
