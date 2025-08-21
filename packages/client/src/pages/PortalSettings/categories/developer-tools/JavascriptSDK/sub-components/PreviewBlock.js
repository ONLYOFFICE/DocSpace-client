// (c) Copyright Ascensio System SIA 2009-2025
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
import { useTranslation } from "react-i18next";
import { objectToGetParams } from "@docspace/shared/utils/common";
import { Tabs, TabsTypes } from "@docspace/shared/components/tabs";

import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import CodeReactSvgUrl from "PUBLIC_DIR/images/code.react.svg?url";

import { CodeToInsert } from "./CodeToInsert";
import { GetCodeBlock } from "./GetCodeBlock";

import { Preview } from "../presets/StyledPresets";
import { showPreviewThreshold } from "../constants";

export const PreviewBlock = ({
  loadCurrentFrame,
  preview,
  theme,
  frameId,
  scriptUrl,
  config,
  isDisabled = false,
}) => {
  const { t, ready } = useTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "Translations",
    "SharingPanel",
    "CreateEditRoomDialog",
  ]);

  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );
  const params = objectToGetParams(config);

  const codeBlock = `<div id="${frameId}">Fallback text</div>\n<script src="${scriptUrl}${params}"></script>`;

  const code = (
    <CodeToInsert
      t={t}
      tReady={ready}
      codeBlock={codeBlock}
      scriptUrl={scriptUrl}
      config={config}
      theme={theme}
    />
  );
  const dataTabs = [
    {
      id: "preview",
      name: t("Common:Preview"),
      content: preview,
      iconName: EyeReactSvgUrl,
    },
    {
      id: "code",
      name: t("Code"),
      content: code,
      iconName: CodeReactSvgUrl,
    },
  ];

  const [selectedItemId, setSelectedItemId] = useState(dataTabs[0].id);

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
        layoutId="preview"
        hotkeysId="preview"
        type={TabsTypes.Secondary}
        onSelect={(e) => {
          setSelectedItemId(e.id);
          loadCurrentFrame(e);
        }}
        items={dataTabs}
        isLoading={!ready}
        selectedItemId={selectedItemId}
      />
    </Preview>
  ) : (
    <GetCodeBlock t={t} codeBlock={codeBlock} isDisabled={isDisabled} />
  );
};
