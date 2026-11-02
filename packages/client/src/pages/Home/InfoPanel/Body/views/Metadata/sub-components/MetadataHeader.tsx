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

import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import { useMetadataAIAvailable } from "../hooks/useMetadataAIAvailable";
import { useOpenMetadataAI } from "../hooks/useOpenMetadataAI";
import type { TAddMetadataActions, TMetadataSelection } from "../types";
import AddMetadataMenu from "./AddMetadataMenu";
import MetadataAIMenu from "./MetadataAIMenu";
import styles from "../Metadata.module.scss";

type MetadataHeaderProps = {
  selection: TMetadataSelection;
  addActions?: TAddMetadataActions;
};

const MetadataHeader = ({ selection, addActions }: MetadataHeaderProps) => {
  const { t } = useTranslation(["Metadata", "Common"]);
  const isAIAvailable = useMetadataAIAvailable(selection);
  const openAI = useOpenMetadataAI(selection);

  return (
    <div className={styles.header}>
      <Text
        className={styles.hint}
        fontSize="14px"
        fontWeight={600}
        lineHeight="16px"
      >
        {t("Common:SubmenuMetadata")}
      </Text>
      {addActions ? (
        <div className={styles.headerActions}>
          {isAIAvailable ? (
            <MetadataAIMenu
              onFill={() => openAI("fill")}
              onGenerate={() => openAI("suggest")}
            />
          ) : null}
          <AddMetadataMenu {...addActions}>
            {(openMenu) => (
              <IconButton
                iconName={FormFileReactSvgUrl}
                size={16}
                isFill
                title={t("Metadata:AddMetadata")}
                onClick={openMenu}
                dataTestId="info_panel_metadata_add_button"
              />
            )}
          </AddMetadataMenu>
        </div>
      ) : null}
    </div>
  );
};

export default observer(MetadataHeader);
