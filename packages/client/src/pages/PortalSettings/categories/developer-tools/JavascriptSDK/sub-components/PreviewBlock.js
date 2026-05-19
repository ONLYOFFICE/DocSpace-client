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

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { objectToGetParams } from "@docspace/shared/utils/common";
import { Tabs, TabsTypes } from "@docspace/ui-kit/components/tabs";

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
  showScriptParamsWithEvents = false,
}) => {
  const { t, ready } = useTranslation([
    "JavascriptSdk",
    "Files",
    "EmbeddingPanel",
    "Common",
    "Translations",
    "CreateEditRoomDialog",
  ]);

  const [showPreview, setShowPreview] = useState(
    window.innerWidth > showPreviewThreshold,
  );
  const { events: _, ...configWithoutEvents } = config;
  const params = objectToGetParams(configWithoutEvents);

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
          if (e.id === "preview") loadCurrentFrame(e);
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

