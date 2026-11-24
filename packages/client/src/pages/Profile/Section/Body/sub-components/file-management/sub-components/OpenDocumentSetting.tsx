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

import React from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { isMobile } from "react-device-detect";

import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { RadioButtonGroup } from "@onlyoffice/apps-ui-kit/components/radio-button-group";
import { DeepLinkType } from "@docspace/shared/enums";

import type CommonStore from "SRC_DIR/store/CommonStore";

const STORAGE_KEY = "defaultOpenDocument";

type TOpenDocumentChoice = "ask" | "app" | "web";

const readChoice = (): TOpenDocumentChoice => {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "app" || value === "web" ? value : "ask";
};

type Props = {
  className?: string;
  deepLinkSettings?: CommonStore["deepLinkSettings"];
  getDeepLinkSettings?: CommonStore["getDeepLinkSettings"];
};

const OpenDocumentSettingComponent = ({
  className,
  deepLinkSettings,
  getDeepLinkSettings,
}: Props) => {
  const { t } = useTranslation(["FilesSettings"]);

  const [choice, setChoice] = React.useState(readChoice);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!isMobile || !getDeepLinkSettings) return;

    getDeepLinkSettings()
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(false));
  }, [getDeepLinkSettings]);

  const isChoiceAllowed =
    (deepLinkSettings ?? DeepLinkType.Choice) === DeepLinkType.Choice;

  if (!isMobile || !isLoaded || !isChoiceAllowed) return null;

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    if (value === "app" || value === "web") {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }

    setChoice(readChoice());
  };

  return (
    <div className={className} data-testid="open_document_setting">
      <Text lineHeight="20px" fontWeight={600}>
        {t("FilesSettings:OpenDocumentsOnMobile")}
      </Text>
      <RadioButtonGroup
        fontSize="13px"
        fontWeight={400}
        orientation="vertical"
        spacing="8px"
        dataTestId="open_document_radio_button_group"
        options={[
          {
            id: "open-document-ask",
            label: t("FilesSettings:AskEveryTime"),
            value: "ask",
            dataTestId: "open_document_ask",
          },
          {
            id: "open-document-app",
            label: t("FilesSettings:OpenInMobileApp"),
            value: "app",
            dataTestId: "open_document_app",
          },
          {
            id: "open-document-web",
            label: t("FilesSettings:OpenInMobileBrowser"),
            value: "web",
            dataTestId: "open_document_web",
          },
        ]}
        selected={choice}
        onClick={onSelect}
      />
    </div>
  );
};

export const OpenDocumentSetting = inject(({ common }: TStore) => ({
  deepLinkSettings: common.deepLinkSettings,
  getDeepLinkSettings: common.getDeepLinkSettings,
}))(observer(OpenDocumentSettingComponent));
