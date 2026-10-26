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

import EmptyLightSvgUrl from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.light.svg?url";
import EmptyDarkSvgUrl from "PUBLIC_DIR/images/emptyview/empty.rooms.root.user.dark.svg?url";
import AIReactSvg from "PUBLIC_DIR/images/icons/12/AI.svg";
import PlusReactSvg from "PUBLIC_DIR/images/plus.react.svg";

import { useTranslation } from "react-i18next";

import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { ActionButton } from "@onlyoffice/apps-ui-kit/components/action-button";
import { EmptyScreenContainer } from "@onlyoffice/apps-ui-kit/components/empty-screen-container";

import styles from "../MetadataAIPanel.module.scss";

type NothingToFillProps = {
  onSuggest: () => void;
  onAddTemplate: () => void;
};

const NothingToFill = ({ onSuggest, onAddTemplate }: NothingToFillProps) => {
  const { t } = useTranslation(["Metadata", "Files"]);
  const { isBase } = useTheme();

  return (
    <EmptyScreenContainer
      className={styles.empty}
      imageSrc={isBase ? EmptyLightSvgUrl : EmptyDarkSvgUrl}
      imageAlt=""
      headerText={t("Metadata:NoFileMetadata")}
      descriptionText={t("Metadata:AINoMetadataDescription")}
      buttons={
        <>
          <ActionButton
            icon={<AIReactSvg />}
            label={t("Files:SuggestMetadataWithAI")}
            onClick={onSuggest}
            data-testid="metadata_ai_suggest_button"
          />
          <ActionButton
            icon={<PlusReactSvg />}
            label={t("Metadata:AddMetadata")}
            onClick={onAddTemplate}
            data-testid="metadata_ai_add_metadata_button"
          />
        </>
      }
    />
  );
};

export default NothingToFill;
